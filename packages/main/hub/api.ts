import https from 'node:https'
import {
  FindPackagesResponse,
  GetResourceDetailResponse,
  GetResourcesResponse,
  RequestPayload,
} from './types'

type RequestOptions = {
  hostname: string
  path: string
  port: number
  headers?: Record<string, string | number>
}

const globalOptions: RequestOptions = {
  hostname: 'https://hub.virtamate.com',
  path: '/citizenx/api.php',
  port: 443,
  headers: {
    'Content-Type': 'application/json',
  },
}

const isDateString = (value: unknown): value is Date => {
  return value instanceof Date && !Number.isNaN(value.valueOf())
}

const isNumberString = (value: unknown): value is number => {
  return !Number.isNaN(Number(value))
}

// const stringifyObject = <T = Record<string, unknown>>(obj: T) => {
//   const result: Record<string, string> = {}

//   for (const [key, value] of Object.entries(obj)) {
//     if (typeof value === 'string') {
//       result[key] = value
//     } else if (typeof value === 'number') {
//       result[key] = value.toString()
//     } else if (Array.isArray(value)) {
//       result[key] = value.join(',')
//     }
//   }

//   return result
// }

const parseValue = (value?: unknown) => {
  if (value == null || value === 'undefined' || value === 'null') {
    return
  }

  if (typeof value === 'number') {
    return value
  }

  if (isNumberString(value)) {
    if (isDateString(value)) {
      return new Date(value * 1000)
    }

    return Number(value)
  }

  if (Array.isArray(value)) {
    return value.map(parseResponse)
  }

  return value
}

const parseResponse = <T extends Record<string, unknown>>(response: T) => {
  const resp: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(response)) {
    if (value == null || value === 'undefined' || value === 'null') {
      return
    }

    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        resp[key] = parseValue(value)
      } else if (Object.keys(value).length > 0) {
        resp[key] = parseResponse(value as Record<string, unknown>)
      }
    } else {
      resp[key] = parseValue(value)
    }
  }

  return resp
}

const makeRequest = async <T>(
  method: 'GET' | 'POST',
  payload?: Record<string, unknown>
) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      ...payload,
      source: 'VaM',
    })

    const opts = {
      ...globalOptions,
      method,
      headers: {
        ...globalOptions.headers,
        'Content-Length': body.length,
      },
    }

    const req = https.request(opts, (res) => {
      res.on('data', (d) => resolve(parseResponse(JSON.parse(d)) as T))
    })

    req.on('error', (e) => reject(e))
    req.write(JSON.stringify(body))
    req.end()
  })
}

const getPackageDetails = async (resourceId: string) => {
  const payload = {
    action: 'getResourceDetail',
    latest_image: 'Y',
    resource_id: resourceId,
  }

  return makeRequest<GetResourceDetailResponse>('POST', payload)
}

const findPackages = async (...packageIds: string[]) => {
  const payload = {
    action: 'findPackages',
    packages: packageIds.join(','),
  }

  return makeRequest<FindPackagesResponse>('POST', payload)
}

const getLatestPackages = async (
  page = 1,
  perpage = 48,
  location = 'Hub And Dependencies',
  category = 'Free',
  sort = 'Latest Update'
) => {
  const payload: Omit<RequestPayload, 'source'> = {
    action: 'getResources',
    latest_image: 'Y',
    perpage,
    page,
    location,
    category,
    sort,
  }

  return makeRequest<GetResourcesResponse>('POST', payload)
}

export default {
  getLatestPackages,
  findPackages,
  getPackageDetails,
}

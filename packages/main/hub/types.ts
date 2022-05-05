export type RequestPayload = {
  action: string
  category: string
  latest_image: 'Y' | 'N'
  location: string
  page: number
  perpage: number
  sort: string
  source: 'VaM'
}

type ResponseProps = 'status'
type PaginationProps =
  | 'next_page'
  | 'page'
  | 'perpage'
  | 'prev_page'
  | 'total_found'
  | 'total_pages'

type ParameterProps =
  | 'action'
  | 'category'
  | 'location'
  | 'min_tag_ct'
  | 'min_user_ct'
  | 'page'
  | 'perpage'
  | 'search'
  | 'searchall'
  | 'sort'
  | 'source'
  | 'tags'
  | 'type'
  | 'username'

type Response = Record<ResponseProps, string>
type Pagination = Record<PaginationProps, string>
type Parameters = Record<ParameterProps, string>

type PackageMetaProps =
  | 'filename'
  | 'file_size'
  | 'licenseType'
  | 'package_id'
  | 'resource_id'
  | 'downloadUrl'

type PackageMeta = Record<PackageMetaProps, string>

type HubFileProps =
  | PackageMetaProps
  | 'programVersion'
  | 'urlHosted'
  | 'creatorName'
  | 'attachment_id'

type HubFile = Record<HubFileProps, string>

type ResourceProps =
  | 'avatar_date'
  | 'category'
  | 'current_version_id'
  | 'dependency_count'
  | 'discussion_thread_id'
  | 'download_count'
  | 'download_url'
  | 'external_url'
  | 'hubDownloadable'
  | 'hubFiles'
  | 'hubHosted'
  | 'icon_url'
  | 'image_url'
  | 'last_update'
  | 'package_id'
  | 'parent_category_id'
  | 'promotional_link'
  | 'rating_avg'
  | 'rating_count'
  | 'rating_weighted'
  | 'reaction_score'
  | 'release_date'
  | 'resource_date'
  | 'resource_id'
  | 'review_count'
  | 'tag_line'
  | 'tags'
  | 'thtrending_downloads_per_minute'
  | 'thtrending_positive_rating_count'
  | 'thtrending_positive_ratings_per_minute'
  | 'title'
  | 'type'
  | 'update_count'
  | 'user_id'
  | 'username'
  | 'version_string'
  | 'view_count'

type Resource = Record<ResourceProps, string>

type DependencyProps =
  | PackageMetaProps
  | 'packageName'
  | 'version'
  | 'latest_version'
  | 'latest_version_string'
  | 'resource_id'
  | 'latestUrl'
  | 'promotional_link'

type Dependency = Record<DependencyProps, string>

export type GetResourcesResponse = Response & {
  pagination: Pagination
  parameters: Parameters
  resources: Resource[]
}

export type GetResourceDetailResponse = Response &
  Resource & {
    dependencies: Record<string, Dependency[]>
  }

export type GetInfoResponse = Response & {
  category: string[]
  last_update: string
  location: string[]
  other_options: {
    search: string
    searchall: string
  }
  parameters: Parameters
  sort: string[]
  tags: {
    [tag: string]: {
      ct: number
    }
  }
  type: string[]
}

export type FindPackagesResponse = Response & {
  packages: Record<string, PackageMeta>
}

import { useCallback, useState } from 'react'

const parseInitialState = <T>(initialState: T | (() => T)) => {
  if (initialState instanceof Function) {
    return initialState()
  }

  return initialState
}

export default function useLocalStorage<T>(
  key: string,
  initialState: T | (() => T)
): [T, (value: T) => void] {
  const [state, set] = useState<T>(() => {
    try {
      const serializedState = localStorage.getItem(key)

      if (serializedState == null) {
        return parseInitialState(initialState)
      }
      return JSON.parse(serializedState)
    } catch {
      return parseInitialState(initialState)
    }
  })

  const setState = useCallback(
    (newState: T, persist = true) => {
      set(newState)

      if (persist) {
        localStorage.setItem(key, JSON.stringify(newState))
      }
    },
    [key]
  )

  return [state, setState]
}

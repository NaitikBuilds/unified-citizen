import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DependencyList,
} from 'react'

export interface AsyncState<T> {
  data: T | null
  error: unknown
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
}

export interface AsyncResult<T> extends AsyncState<T> {
  /** Re-runs the async function with the same deps. */
  reload: () => void
}

const initialLoading = {
  data: null,
  error: null,
  isLoading: true,
  isSuccess: false,
  isError: false,
} as const

/**
 * Runs an async function on mount (and whenever deps change), exposing
 * loading / success / empty / error state. Guards against setState after
 * unmount.
 */
export function useAsync<T>(
  fn: () => Promise<T>,
  deps: DependencyList = [],
): AsyncResult<T> {
  const [state, setState] = useState<AsyncState<T>>({ ...initialLoading })
  const mountedRef = useRef(true)
  const runIdRef = useRef(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableFn = useCallback(fn, deps)

  const run = useCallback(() => {
    const runId = runIdRef.current + 1
    runIdRef.current = runId

    setState({ data: null, error: null, isLoading: true, isSuccess: false, isError: false })

    stableFn()
      .then((data) => {
        if (mountedRef.current && runIdRef.current === runId) {
          setState({ data, error: null, isLoading: false, isSuccess: true, isError: false })
        }
      })
      .catch((error: unknown) => {
        if (mountedRef.current && runIdRef.current === runId) {
          setState({ data: null, error, isLoading: false, isSuccess: false, isError: true })
        }
      })
  }, [stableFn])

  useEffect(() => {
    mountedRef.current = true
    run()
    return () => {
      mountedRef.current = false
    }
  }, [run])

  return { ...state, reload: run }
}

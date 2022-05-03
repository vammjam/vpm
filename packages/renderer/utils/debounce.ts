export default function debounce<T>(
  func: (...args: T[]) => unknown,
  timeout = 300
) {
  let timer: NodeJS.Timeout

  return (...args: T[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(func, args)
    }, timeout)
  }
}

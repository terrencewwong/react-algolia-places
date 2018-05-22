// @flow
export const compose = (...fns: *) => (...args: *) => {
  fns.forEach(fn => fn && fn(...args))
}

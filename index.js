const { or, and, appendo, lvar, eq } = require('logic_js')

function phrase(s) {
  if (Array.isArray(s)) return (l, l1) => appendo(s, l1, l)
  if (typeof s === 'function') {
    if (s.length == 0) s = s()
    if (s.length == 1) return (l, l1) => and(s, eq(l, l1))
    if (s.length == 2) return s
  }
  throw new Error('Invalid argument for phrase: ' + s)
}

function or_(...symbols) {
  return (l, l1) => or(...symbols.map((b, i) => {
    if (i === 0 && typeof b === 'number') return b // count
    return phrase(b)(l, l1)
  }))
}

function and_(...symbols) {
  return (l, l1) => {
    let cur = l
    return and(...symbols.map((b, i) => {
      next = i === symbols.length - 1 ? l1 : lvar()
      const r = phrase(b)(cur, next)
      cur = next
      return r
    }))
  }
}

module.exports = { or_, and_, phrase }

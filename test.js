const { describe, it } = require('tinymocha')
const { nt, or_, and_ } = require('.')
const { run, lvar, eq, and, or, appendo } = require('logic_js')
const assert = require('assert').strict

describe('logic.js-dcg', () => {
  it('can be substituted with pure logic.js', () => {
    const determinant = (l, l1, d = lvar()) => and(
      or(eq(d, 'a'), eq(d, 'the')),
      appendo([d], l1, l)
    )
    const noun = (x, l, l1) => and(
      or(eq(x, 'cat'), eq(x, 'mouse')),
      appendo([x], l1, l)
    )
    const sentence = (x, l, l2, l1 = lvar()) => and(
      determinant(l, l1),
      noun(x, l1, l2)
    )
    const x = lvar('x'), rest = lvar('rest')
    assert.deepEqual(
      run([x, rest], sentence(x, ['a', 'cat'], rest)),
      [{x: 'cat', rest: []}])
    const list = lvar('list')
    assert.deepEqual(
      run([x, list], sentence(x, list, [])),
      [
        {x: 'cat', list: ['a', 'cat']},
        {x: 'mouse', list: ['a', 'mouse']},
        {x: 'cat', list: ['the', 'cat']},
        {x: 'mouse', list: ['the', 'mouse']},
      ])
  })
})




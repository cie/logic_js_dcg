const { describe, it } = require('tinymocha')
const { or_, and_, phrase } = require('.')
const { run, lvar, eq, and, or, appendo, membero, succeed, fail } = require('logic_js')
const assert = require('assert').strict

const xit = () => {}

function check(vars, logic, expected) {
  assert.deepEqual(run(vars, logic), expected)
}


describe('logic.js-dcg', () => {
  describe('phrase', () => {
    it('can parse constant terminals', () => {
      const the = phrase(['in', 'the'])
      console.log(run([], the(['in', 'the'], [])))
      check([], the(['in', 'the'], []), [{}])
      check([], the(['in'], []), [])
      check([], the([], []), [])
      check([], the(['a'], []), [])
    })
    it('is idempotent', () => {
      const the = phrase(phrase(['the']))
      check([], the(['the'], []), [{}])
      check([], the([], []), [])
      check([], the(['a'], []), [])
    })
    it('can take a logic value', () => {
      const empty = phrase(succeed())
      const never = phrase(fail())
      const x = lvar('x')
      check([x], empty(['the'], x), [{x: ['the']}])
      check([x], never(['the'], x), [])
    })
    it('can take a nullary function', () => {
      const empty = phrase(() => succeed())
      const never = phrase(() => fail())
      const x = lvar('x')
      check([x], empty(['the'], x), [{x: ['the']}])
      check([x], never(['the'], x), [])
    })
  })
  describe('and_', () => {
    it('can take a single terminal', () => {
      const determinant = and_(['a'])
      const x = lvar('x')
      check([x], determinant(x, []), [{x: ['a']}])
    })
    it('can take terminals', () => {
      const NP = and_(['a'], ['dog'])
      const x = lvar('x')
      check([x], NP(x, []), [{x: ['a', 'dog']}])
    })
    it('can take logic values and phrases', () => {
      const noun = x => membero(x, ['dog', 'cat'])
      const N = (t = lvar()) => and_(noun(t), [t])
      const NP = and_(['a'], N())
      const x = lvar('x')
      check([x], NP(x, []), [{x: ['a', 'dog']}, {x: ['a', 'cat']}])
    })
  })
  describe('or_', () => {
    it('can take terminals', () => {
      const determinant = or_(['a'], ['the'])
      const x = lvar('x')
      check([x], determinant(x, []), [{x: ['a']}, {x: ['the']}])
    })
    it('can take more terminals', () => {
      const NP = or_(['a', 'cat'], ['the', 'mouse'])
      const x = lvar('x')
      check([x], NP(x, []), [{x: ['a', 'cat']}, {x: ['the', 'mouse']}])
    })
    it('can take phrases', () => {
      const NP = or_(and_(['a'], ['cat']), and_(['the'], ['mouse']))
      const x = lvar('x')
      check([x], NP(x, []), [{x: ['a', 'cat']}, {x: ['the', 'mouse']}])
    })
  })
  it('can create simple grammar', () => {
    const determinant = or_(['a'], ['the'])
    const noun = (x) => and_(membero(x, ['cat', 'mouse']), [x])
    const NP = (x) => and_(determinant, noun(x))

    const x = lvar('x'), rest = lvar('rest'), list = lvar('list')
    check([rest], determinant(['a', 'cat'], rest),
      [{rest: ['cat']}])
    check([x, list], noun(x)(list, []),
      [
        {x: 'cat', list: ['cat']},
        {x: 'mouse', list: ['mouse']}
      ])
    check([x, rest], noun(x)(['cat'], rest),
      [{x: 'cat', rest: []}])
    check([x, rest], NP(x)(['a', 'cat'], rest),
      [{x: 'cat', rest: []}])
    check([x, list], NP(x)(list, []),
      [
        {x: 'cat', list: ['a', 'cat']},
        {x: 'mouse', list: ['a', 'mouse']},
        {x: 'cat', list: ['the', 'cat']},
        {x: 'mouse', list: ['the', 'mouse']},
      ])
  })
  it('can be implemented with pure logic.js', () => {
    const determinant = (l, l1, d = lvar()) => and(
      or(eq(d, 'a'), eq(d, 'the')),
      appendo([d], l1, l)
    )
    const noun = (x, l, l1) => and(
      or(eq(x, 'cat'), eq(x, 'mouse')),
      appendo([x], l1, l)
    )
    const NP = (x, l, l2, l1 = lvar()) => and(
      determinant(l, l1),
      noun(x, l1, l2)
    )
    const x = lvar('x'), rest = lvar('rest')
    check(
      [x, rest],
      NP(x, ['a', 'cat'], rest),
      [{x: 'cat', rest: []}]
    )
    const list = lvar('list')
    check(
      [x, list],
      NP(x, list, []),
      [
        {x: 'cat', list: ['a', 'cat']},
        {x: 'mouse', list: ['a', 'mouse']},
        {x: 'cat', list: ['the', 'cat']},
        {x: 'mouse', list: ['the', 'mouse']},
      ]
    )
  })
})




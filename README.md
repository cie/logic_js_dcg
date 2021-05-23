# logic.js definite clause grammars

This library is a DCG package for [logic.js](https://github.com/shd101wyy/logic.js) (not [LogicJS](https://github.com/mcsoto/LogicJS)!).
Its functionality is similar to Prolog's DCGs.

## Usage

```
npm add logic_js_dcg
```

The equivalent of `,//2` and `;//2` are `and_` and `or_`. There is no need for `-->`, just use `and_`, `or_`, or `phrase` if there is just one argument. You can specify terminals in `[]` just as in Prolog.

```javascript
import { run, lvar } from "logic_js"
import { and_, or_, phrase } from "logic_js_dcg"
const
  verb = phrase(['chases']),
  noun = or_(['cat'], ['mouse']),
  det = or_(['the'], ['a']),
  noun_phrase = and_(det, noun),
  verb_phrase = and_(verb, noun_phrase),
  sentence = and_(noun_phrase, verb_phrase)
const x = lvar('x')
run([x], sentence(x, []))
  // => [ { x: [ 'the', 'cat', 'chases', 'the', 'cat' ] }, { x: [ 'the', 'cat', 'chases', 'the', 'mouse' ] }... 
```

If you want your productions to have arguments, or you need to declare local logic variables, turn them into functions. For conditions, no need for Prolog's `{}`, just use a logic value as it is:  

```javascript
import { run, lvar, eq } from "logic_js"
import { and_, or_ } from "logic_js_dcg"
const
  det2 = (num) => or_(
    ['the'],
    and_(eq(num, 'sg'), ['a']),
    and_(eq(num, 'pl'), []),
  ),
  noun2 = (num) => or_(
    and_(eq(num, 'sg'), or_(['cat'], ['mouse'])),
    and_(eq(num, 'pl'), or_(['cats'], ['mice']))
  ),
  noun_phrase2 = (num = lvar()) => and_(det2(num), noun2(num))
const x = lvar('x')
run([x], noun_phrase2()(x, []))
```

```
[
  { x: [ 'the', 'cat' ] },
  { x: [ 'the', 'mouse' ] },
  { x: [ 'the', 'cats' ] },
  { x: [ 'the', 'mice' ] },
  { x: [ 'a', 'cat' ] },
  { x: [ 'a', 'mouse' ] },
  { x: [ 'cats' ] },
  { x: [ 'mice' ] }
]

```


Productions are two-argument functions returning a logic value, the two arguments are the difference lists just like in Prolog (but in Prolog the two arguments are appended to the explicit arguments, and here they are curried to a separate function call):

```javascript
const num = lvar('num')
run([num, x], det2(num)(x, []))
```

So the different types you can pass into `phrase` or any argument of `and_` and `or_`.

```javascript
// list of terminals
and_(['a', 'cat'], /* ... */)
// logic value
and_(eq(a, b), /* ... */)
// production (possibly returned by a factory)
and_(det, /* ... */)
and_(det2('pl'), /* ... */)
// nullary function returning a logic value, possibly with optional arguments
and_((x = lvar()) => eq(x, a), /* ... */)
// nullary function returning a production, possibly with optional arguments
and_((x = lvar()) => det2(x), /* ... */)
```

Also, just like in logic.js, you can pass a number as the first argument of `or_` to limit the number of solutions.

```javascript
run([x], or_(2, noun_phrase2)(x, []))
// => [ { x: [ 'the', 'cat' ] }, { x: [ 'the', 'mouse' ] } ]
```

Note that you don't need to call the nullary `noun_phrase2` as it appears as an argument to `or_`.

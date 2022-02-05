# compact-encoding-maybe-enum

Generate [compact encoding](https://github.com/compact-encoding/compact-encoding) for defined enum or limited length arbitrary string

## why

An example of where this might be useful is encoding the value of a `type` property, where a set of strings are expected to be used 90% of the time, so encoding them as strings is quite wasteful, but you don't want to prohibit arbitrary strings either.

The trade-off used here is to:

- limit the arbitrary string length to `127` character.
- limit the enum to `128` member.

This way, we only need to store a value between `0 - 127` in the first byte, while the `msb` indicates whether the string is encoded as an enum or a string .

## How it works

`0000 0000` => `0111 1111` values encode the index of the enum member.

`1000 0000` => `1111 1111` values encode the length of the arbitrary string, after switching the `msb` to `0` (xor 0x80).

## Installation

```
npm install compact-encoding-maybe-enum
```

## Usage

```js
import c from 'compact-encoding';
import { maybeEnum } from 'compact-encoding-maybe-enum';

const enc = maybeEnum(['foo', 'bar']);

// Encoding decoding a member of enum
const encoded = c.encode(enc, 'bar');
//=> <Buffer 0x01>
const decoded = c.decode(enc, encoded);
//=> 'bar'

// Encoding decoding arbitrary string
const encoded = c.encode(enc, 'x');
//=> <Buffer 81 78>
const decoded = c.decode(enc, encoded);
//=> 'x'
```

## API

#### `const enc = maybeEnum(members)`

`members` should be an array of unique strings (set) with maximum length of `0x80` (128) members.

#### with compact encoding: `c.encode(enc, value)`

`value` should be a string from `members`, or an arbitrary string with maximum length of `0x7f` (127) characters.

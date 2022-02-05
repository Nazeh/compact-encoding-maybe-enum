# compact-encoding-maybe-enum

Generate [compact encoding](https://github.com/compact-encoding/compact-encoding) for defined enum or limited length arbitrary string

## Usage

```js
import c from 'compact-encoding';
import { maybeEnum } from 'compact-encoding-maybe-enum';

const enc = maybeEnum(['a', 'b', 'c']);

// Encoding decoding a member of enum
const encoded = c.encode(enc, 'b'); // 0x01
const decoded = c.decode(enc, encoded); // 'b'

// Encoding decoding arbitrary string
const encoded = c.encode(enc, 'foo'); // <Buffer 83 66 6f 6f>
const decoded = c.decode(enc, encoded); // 'foo'
```

## API

#### `const enc = maybeEnum(members)`

`members` should be an array of unique strings (set) with maximum length of `0x80` (128) members.

#### with compact encoding: `c.encode(enc, value)`

`value` should be a string from `members`, or an arbitrary string with maximum length of `0x80` (128) characters.

## How it works

### Encoding

Encoding starts by checking if the value is a member of the enum:

- If so the index is stored in the first byte.

- Else the first byte is set to `Buffer.byteLength(value) + 0x80` followed by the bytes encoding the string.

### Decoding

Decoding starts by examining the next byte in [`state.buffer`](https://github.com/compact-encoding/compact-encoding#state):

- If `0x00 >= byte <= 0x7f`, the byte is used as the index of the member of the enum.

- Else if `0x80 <= byte <= 0xff`, the byte is used as the byteLength of the string after subtracting `0x80`.

## Limitations

- The maximum length of the enum is `0x80` (128) members.

- The maximum length of the string is `0x80` (128) characters.

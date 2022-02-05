import b4a from 'b4a'

/**
 *
 * @param {Array} members
 * @returns
 */
export const maybeEnum = (members) => {
  if (new Set(members).size < members.length) {
    throw new Error('members are not unique')
  }

  if (members.length > 0x80) {
    throw new Error("Enum members' length must be <= 0x80")
  }

  return {
    preencode (state, value) {
      state.end += 1
      if (members.indexOf(value) < 0) state.end += b4a.byteLength(value)
    },
    encode (state, value) {
      const bytes = members.indexOf(value)

      if (bytes >= 0) {
        state.buffer[state.start++] = bytes
      } else {
        // value is not in the enum members, so we encode it as a string.
        const len = b4a.byteLength(value)
        if (len >= 0x80) throw new Error('string is too long')
        state.buffer[state.start++] = 0x80 | len

        b4a.write(state.buffer, value, state.start)
        state.start += len
      }
    },
    decode (state) {
      const byte = state.buffer[state.start++]
      if (byte & 0x80) {
        // value is not in the enum members, so we decode it as a string.
        const len = byte ^ 0x80
        if (state.end - state.start < len) throw new Error('Out of bounds')
        return b4a.toString(
          state.buffer,
          'utf-8',
          state.start,
          (state.start += len)
        )
      } else {
        return members[byte]
      }
    }
  }
}

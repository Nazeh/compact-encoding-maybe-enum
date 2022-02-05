import { expect } from 'aegir/utils/chai.js'
import c from 'compact-encoding'
import { maybeEnum } from '../src/index.js'
import b4a from 'b4a'

it('should throw an error for too large members set', () => {
  expect(() =>
    maybeEnum(new Array(0x80).fill(0).map((_, i) => i))
  ).to.not.throw(Error)
  expect(() => maybeEnum(new Array(0x81).fill(0).map((_, i) => i))).to.throw(
    Error
  )
})
it('should throw an error for too duplicate values', () => {
  expect(() => maybeEnum(['a', 'b', 'a'])).to.throw(Error)
})

it('should encode members correctly', () => {
  const members = ['foo', 'bar', 'zar']

  const encoded = members.map((el) => c.encode(maybeEnum(members), el))

  const bytes = members.map((_, index) => b4a.from([index]))

  expect(encoded).to.eql(bytes)
})

it('should decode members correctly', () => {
  const members = ['foo', 'bar', 'zar', 'long'.repeat(0x80)]

  const bytes = members.map((_, index) => b4a.from([index]))

  const decoded = bytes.map((byte) => c.decode(maybeEnum(members), byte))

  expect(decoded).to.eql(members)
})

it('should encode arbitrary string correctly', () => {
  const encoded = c.encode(maybeEnum([]), 'hello world')

  const bytes = b4a.from('hello world')

  expect(encoded).to.eql(
    b4a.from([b4a.byteLength('hello world') + 0x80, ...bytes])
  )
})

it('should decode arbitrary string correctly', () => {
  const bytes = b4a.from([
    b4a.byteLength('hello world') + 0x80,
    ...b4a.from('hello world')
  ])

  const decoded = c.decode(maybeEnum([]), bytes)

  expect(decoded).to.eql('hello world')
})

it('should correctly encode and decode an empty string', () => {
  const value = ''

  const encoded = c.encode(maybeEnum([]), value)

  const bytes = b4a.from(value)

  expect(encoded).to.eql(b4a.from([b4a.byteLength(value) + 0x80, ...bytes]))

  expect(c.decode(maybeEnum([]), encoded)).to.eql(value)
})

it('should correctly encode and decode an arbitrary string with max length', () => {
  const value = 'h'.repeat(0x7f)

  const encoded = c.encode(maybeEnum([]), value)

  const bytes = b4a.from(value)

  expect(encoded).to.eql(b4a.from([b4a.byteLength(value) + 0x80, ...bytes]))

  expect(c.decode(maybeEnum([]), encoded)).to.eql(value)
})

it('should throw an error for arbitrary strings longer than 0x80 charcters', () => {
  expect(() => c.encode(maybeEnum([]), 'h'.repeat(0x7f))).to.not.throw(Error)
  expect(() => c.encode(maybeEnum([]), 'h'.repeat(0x80))).to.throw(Error)
})

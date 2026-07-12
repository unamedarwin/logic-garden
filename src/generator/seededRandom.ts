import { seed, type Seed } from '../domain/types'

const hashSeed = (value: string) => {
  let hash = 2_166_136_261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16_777_619)
  }
  return hash >>> 0
}

export class SeededRandom {
  private state: number

  constructor(source: Seed | string) {
    this.state = hashSeed(source)
  }

  next() {
    this.state += 0x6d2b79f5
    let value = this.state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296
  }

  integer(minimum: number, maximum: number) {
    return Math.floor(this.next() * (maximum - minimum + 1)) + minimum
  }

  pick<Value>(values: readonly Value[]): Value {
    if (values.length === 0) throw new Error('No es pot escollir d’una llista buida.')
    return values[this.integer(0, values.length - 1)] as Value
  }

  shuffle<Value>(values: readonly Value[]) {
    const shuffled = [...values]
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const target = this.integer(0, index)
      ;[shuffled[index], shuffled[target]] = [
        shuffled[target] as Value,
        shuffled[index] as Value,
      ]
    }
    return shuffled
  }
}

export const deriveSeed = (source: Seed | string, attempt: number): Seed =>
  seed(`${source}|${attempt}`)

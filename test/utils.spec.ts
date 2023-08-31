import { floor } from '$/utils'
import avg from '$/utils/avg'

describe('floor', () => {
    it('does floor', () => {
        expect(floor(0.0012)).toEqual(0)
        expect(floor(0.012)).toEqual(0.01)
        expect(floor(0.992)).toEqual(0.99)
        expect(floor(1.0101)).toEqual(1.01)
    })
})

describe('avg', () => {
    it('calculates a global average', () => {
        expect(avg(1)).toBe(1 / 1)
        expect(avg(2)).toBe(3 / 2)
        expect(avg(3)).toBe(6 / 3)
        expect(avg(4)).toBe(9 / 3)
        expect(avg(4)).toBe(11 / 3)
        expect(avg(4)).toBe(12 / 3)
        expect(avg(4)).toBe(12 / 3)
    })
})

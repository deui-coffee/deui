import { floor } from '$/utils'

describe('floor', () => {
    it('does floor', () => {
        expect(floor(0.0012)).toEqual(0)
        expect(floor(0.012)).toEqual(0.01)
        expect(floor(0.992)).toEqual(0.99)
        expect(floor(1.0101)).toEqual(1.01)
    })
})

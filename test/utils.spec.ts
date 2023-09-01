import avg from '$/utils/avg'

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

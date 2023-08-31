function round(value: number) {
    return 0 | (0.5 + value)
}

export function toU8P4(value: number) {
    return round(value * 16)
}

export function toU10P0(value: number): [number, number] {
    return [(value >> 8) & 0x3, value & 0xff]
}

export function toU8P1(value: number) {
    return round(value * 2)
}

export function floor(x: number) {
    return (0 | (x * 100)) / 100
}

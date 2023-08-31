/**
 * We're using it just for the water level so 1 cache/memo
 * object is fine.
 */

let values: number[] = []

export default function avg(value: number, maxLength: number = 3) {
    values = [...values, value].slice(-maxLength)

    return values.reduce((sum, v) => sum + v, 0) / values.length
}

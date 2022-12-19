import { MajorState } from '$/consts'
import { useMajorState } from '$/hooks/useMajorState'

export enum Mode {
    Espresso = 'Espresso',
    Steam = 'Steam',
    Flush = 'Flush',
    Water = 'Water',
}

export default function useMode() {
    switch (useMajorState()) {
        case MajorState.Steam:
            return Mode.Steam
        case MajorState.HotWater:
            return Mode.Water
        case MajorState.Clean:
            return Mode.Flush
        case MajorState.Espresso:
        default:
            return Mode.Espresso
    }
}

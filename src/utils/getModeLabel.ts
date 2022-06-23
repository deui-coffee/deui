import { ModeId } from '$/features/machine/types'

const labels = ['Espresso', 'Steam', 'Flush', 'Water']

export default function getModeLabel(modeId: ModeId) {
    const label = labels[modeId]

    if (!label) {
        throw new Error('Invalid mode')
    }

    return label
}

import { Buffer } from 'buffer'
import { ShotHeader } from '$/features/cafehub/types'

export default function parseShotHeader(encodedWireBytes: string): ShotHeader {
    const wb = Buffer.from(encodedWireBytes, 'base64')

    return {
        HeaderV: wb.readUint8(0),
        NumberOfFrames: wb.readUint8(1),
        NumberOfPreinfuseFrames: wb.readUint8(2),
        MinimumPressure: wb.readUint8(3),
        MaximumFlow: wb.readUint8(4),
    }
}

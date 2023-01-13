import { Buffer } from 'buffer'
import { ShotFrame } from '$/features/cafehub/types'

export default function parseShotFrame(frames: ShotFrame[], encodedWireBytes: string): ShotFrame[] {
    const wb = Buffer.from(encodedWireBytes, 'base64')

    const frame: ShotFrame = {
        FrameToWrite: wb.readUint8(0),
        Flag: wb.readUint8(1),
        SetVal: wb.readUint8(2),
        Temp: wb.readUint8(3),
        FrameLen: wb.readUint8(4),
        TriggerVal: wb.readUint8(5),
        MaxVol: wb.readUint16BE(6),
    }

    const map: Record<string, ShotFrame> = {}

    for (let i = 0; i < frames.length; i++) {
        const f = frames[i].FrameToWrite === frame.FrameToWrite ? frame : frames[i]

        map[f.FrameToWrite] = f
    }

    return Object.values(map).sort((a, b) => a.FrameToWrite - b.FrameToWrite)
}

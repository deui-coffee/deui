import { MajorState, MinorState } from '$/consts'
import { useCafeHubStore } from '$/stores/ch'
import React, { useReducer, useState } from 'react'
import tw from 'twin.macro'

export default function Debug() {
    const [major, setMajor] = useState<MajorState>()

    const [minor, setMinor] = useState<MinorState>(MinorState.NoState)

    const [visible, toggle] = useReducer((x) => !x, true)

    const { send } = useCafeHubStore()

    return (
        <form
            css={[
                tw`
                    fixed
                    top-4
                    right-4
                    bg-white
                    rounded-md
                    z-10
                `,
            ]}
            onSubmit={(e) => {
                e.preventDefault()

                send(
                    JSON.stringify({
                        command: 'raw',
                        major,
                        minor,
                    })
                )
            }}
        >
            {visible && (
                <>
                    <div
                        css={[
                            tw`
                        p-5
                    `,
                        ]}
                    >
                        Major
                        <br />
                        <select
                            value={major}
                            onChange={(e) => {
                                const v = e.currentTarget.value

                                if (v) {
                                    setMajor(+v)
                                }
                            }}
                        >
                            <option value={MajorState.Idle}>Idle</option>
                            <option value={MajorState.Sleep}>Sleep</option>
                            <option value={MajorState.Espresso}>Espresso</option>
                            <option value={MajorState.Steam}>Steam</option>
                            <option value={MajorState.Clean}>Flush</option>
                            <option value={MajorState.HotWater}>Water</option>
                        </select>
                    </div>
                    <hr />
                    <div
                        css={[
                            tw`
                        p-5
                    `,
                        ]}
                    >
                        Minor
                        <br />
                        <select
                            value={minor}
                            onChange={(e) => {
                                setMinor(+e.currentTarget.value)
                            }}
                        >
                            <option value={MinorState.NoState}>NoState</option>
                            <option value={MinorState.HeatWaterHeater}>HeatWaterHeater</option>
                            <option value={MinorState.Pour}>Pour</option>
                        </select>
                    </div>
                    <hr />
                    <div
                        css={[
                            tw`
                        p-2
                    `,
                        ]}
                    >
                        <button
                            type="submit"
                            css={[
                                tw`
                            bg-[#eee]
                            w-full
                            py-2
                        `,
                            ]}
                        >
                            Send
                        </button>
                    </div>
                    <hr />
                </>
            )}
            <div
                css={[
                    tw`
                        p-2
                    `,
                ]}
            >
                <button
                    onClick={() => void toggle()}
                    type="button"
                    css={[
                        tw`
                            bg-[#eee]
                            w-full
                            py-2
                        `,
                    ]}
                >
                    {visible ? 'Hide' : 'Show'}
                </button>
            </div>
        </form>
    )
}

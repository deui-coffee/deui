import { MachineAction } from '$/features/machine'
import { ModeId } from '$/features/machine/types'
import useModeId from '$/hooks/useModeId'
import getModeLabel from '$/utils/getModeLabel'
import { css } from '@emotion/react'
import React, { ButtonHTMLAttributes, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useSwipeable } from 'react-swipeable'
import tw from 'twin.macro'

type ItemProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'type'> & {
    modeId: ModeId
    onClick?: (id: ModeId) => void
}

function Item({ modeId, onClick, ...props }: ItemProps) {
    const active = modeId === useModeId()

    return (
        <button
            {...props}
            type="button"
            css={[
                css`
                    -webkit-tap-highlight-color: transparent;
                `,
                tw`
                    absolute
                    px-10
                    block
                    w-full
                    text-left
                    h-[70px]
                    top-0
                    left-0
                    font-medium
                    text-light-grey
                    dark:text-medium-grey
                `,
                active &&
                    tw`
                        text-dark-grey
                        dark:text-lighter-grey
                    `,
            ]}
            onClick={() => {
                if (typeof onClick === 'function') {
                    onClick(modeId)
                }
            }}
        >
            {getModeLabel(modeId)}
        </button>
    )
}

const lineup = [ModeId.Espresso, ModeId.Flush, ModeId.Water, ModeId.Steam]

const n = lineup.length

const limit = 500

export default function Revolver() {
    const [phase, setPhase] = useState<number>(0)

    const dispatch = useDispatch()

    const handlers = useSwipeable({
        preventDefaultTouchmoveEvent: true,
        onSwipedUp() {
            if (phase + 1 < limit) {
                dispatch(MachineAction.setModeId(lineup[(((phase + 1) % n) + n) % n]))
                setPhase(phase + 1)
            }
        },
        onSwipedDown() {
            if (phase - 1 > -limit) {
                dispatch(MachineAction.setModeId(lineup[(((phase - 1) % n) + n) % n]))
                setPhase(phase - 1)
            }
        },
    })

    return (
        <div
            {...handlers}
            css={[
                tw`
                    h-full
                    overflow-hidden
                    text-white
                    text-[1.75rem]
                    relative
                `,
            ]}
        >
            <div
                style={{
                    transform: `translateY(${(144 - 70) / 2}px) translateY(${-phase * 70}px)`,
                }}
                css={[
                    tw`
                        transition-transform
                    `,
                ]}
            >
                {[-2, -1, 0, 1, 2].map(
                    (i) =>
                        Math.abs(phase + i) < limit && (
                            <Item
                                key={phase + i}
                                modeId={lineup[(((phase + i) % n) + n) % n]}
                                style={{
                                    top: `${(phase + i) * 70}px`,
                                }}
                                onClick={(modeId) => {
                                    dispatch(MachineAction.setModeId(modeId))
                                    setPhase(phase + i)
                                }}
                            />
                        )
                )}
            </div>
        </div>
    )
}

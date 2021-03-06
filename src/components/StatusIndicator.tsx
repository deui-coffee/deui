import React from 'react'
import tw from 'twin.macro'

export enum Status {
    None = 'none',
    Idle = 'idle',
    Busy = 'busy',
    On = 'on',
    Off = 'off',
}

type Props = {
    value?: Status
    className?: string
}

export default function StatusIndicator({ className, value = Status.Idle }: Props) {
    return (
        <div className={className}>
            <div
                css={[
                    tw`
                        duration-500
                        h-2
                        rounded-full
                        transition-colors
                        w-2
                    `,
                    value === Status.Idle &&
                        tw`
                            bg-lighter-grey
                            dark:bg-dark-grey
                        `,
                    value === Status.Off && tw`bg-red`,
                    value === Status.On && tw`bg-green`,
                    value === Status.Busy &&
                        tw`
                            animate-busy-status
                            dark:text-dark-grey
                            text-lighter-grey
                            transition-none
                        `,
                    value === Status.None && tw`bg-[transparent]`,
                ]}
            />
        </div>
    )
}

import { css } from '@emotion/react'
import React, { HTMLAttributes } from 'react'
import tw, { TwStyle } from 'twin.macro'

export enum Status {
    None = 'none',
    Idle = 'idle',
    Busy = 'busy',
    On = 'on',
    Off = 'off',
}

type Props = HTMLAttributes<HTMLDivElement> & {
    value?: Status
    idleCss?: TwStyle
    offCss?: TwStyle
    onCss?: TwStyle
    busyCss?: TwStyle
    noneCss?: TwStyle
}

const DefaultCss = {
    [Status.Idle]: tw``,
    [Status.Off]: tw`
        text-red
    `,
    [Status.On]: tw`
        text-green
    `,
    [Status.Busy]: tw`
    `,
    [Status.None]: tw`
        text-[transparent]
    `,
}

const defaultIdleCss = tw`
    text-lighter-grey
    dark:text-dark-grey
`

export default function StatusIndicator({ value = Status.Idle, idleCss, ...props }: Props) {
    return (
        <div
            {...props}
            css={[
                tw`
                    h-2
                    w-2
                    absolute
                    pointer-events-none
                    right-2
                    top-2
                `,
                (value === Status.Busy || value === Status.Idle) && (idleCss || defaultIdleCss),
                DefaultCss[value],
            ]}
        >
            <div
                css={[
                    css`
                        background: currentColor;
                    `,
                    tw`
                        rounded-full
                        h-full
                        duration-500
                        transition-colors
                        w-full
                    `,
                    value === Status.Busy &&
                        tw`
                            animate-busy-status
                            transition-none
                        `,
                ]}
            />
        </div>
    )
}

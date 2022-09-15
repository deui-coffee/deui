import { css } from '@emotion/react'
import React, { ButtonHTMLAttributes } from 'react'
import tw from 'twin.macro'
import StatusIndicator, { Status } from './StatusIndicator'

type PaneButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    status?: Status
}

export default function PaneButton({
    type = 'button',
    status = Status.None,
    ...props
}: PaneButtonProps) {
    return (
        <div
            css={[
                tw`
                    relative
                    h-full
                    w-full
                    rounded-lg
                    lg:(border border-lighter-grey bg-white)
                    dark:lg:(border-0 bg-darkish-grey)
                `,
            ]}
        >
            <StatusIndicator
                css={[
                    tw`
                        absolute
                        pointer-events-none
                        right-2
                        top-2
                    `,
                ]}
                value={status}
            />

            <button
                {...props}
                css={[
                    css`
                        -webkit-tap-highlight-color: transparent;
                    `,
                    tw`
                        appearance-none
                        flex
                        h-full
                        items-center
                        justify-center
                        text-t0
                        w-full
                        font-medium
                        text-medium-grey
                        lg:(text-dark-grey)
                        dark:(text-medium-grey)
                        dark:lg:(text-lighter-grey)
                    `,
                ]}
                type={type}
            />
        </div>
    )
}

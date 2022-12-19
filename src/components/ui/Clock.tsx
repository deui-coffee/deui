import useCurrentTime from '$/hooks/useCurrentTime'
import React, { HTMLAttributes } from 'react'
import tw from 'twin.macro'

export default function Clock(props: HTMLAttributes<HTMLDivElement>) {
    const time = useCurrentTime()

    if (typeof time === 'undefined') {
        return (
            <div {...props}>
                {/* Preserve space. */}
                &zwnj;
            </div>
        )
    }

    return (
        <div
            {...props}
            css={[
                tw`
                    select-none
                    text-[200px]
                    flex
                    text-dark-grey
                    dark:text-lighter-grey
                `,
            ]}
        >
            <div
                css={[
                    tw`
                        flex
                    `,
                ]}
            >
                {time.hour}:{time.minute}
            </div>
            <div>
                <span
                    css={[
                        tw`
                            font-medium
                            text-[2rem]
                            uppercase
                            text-light-grey
                            dark:text-medium-grey
                        `,
                    ]}
                >
                    {time.period}
                </span>
            </div>
        </div>
    )
}

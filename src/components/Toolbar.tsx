import React, { HTMLAttributes } from 'react'
import tw from 'twin.macro'

export default function Toolbar({ children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            css={[
                tw`
                    absolute
                    bottom-0
                    left-0
                    w-full
                `,
            ]}
        >
            <div
                {...props}
                css={[
                    tw`
                        h-[9rem]
                        w-full
                        flex
                    `,
                ]}
            >
                {children}
            </div>
        </div>
    )
}

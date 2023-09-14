import { css } from '@emotion/react'
import React, { HTMLAttributes } from 'react'
import tw from 'twin.macro'

export default function Toolbar({ children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            css={tw`
                absolute
                bottom-0
                left-0
                w-full
                bg-[#fafafa]
                dark:bg-black
            `}
        >
            <div
                {...props}
                css={[
                    css`
                        grid-template-columns: 2fr 1fr 2fr;
                        gap: 1px;
                    `,
                    tw`
                        bg-off-white
                        dark:bg-dark-grey
                        h-[9rem]
                        w-full
                        mx-auto
                        max-w-[1400px]
                        grid
                    `,
                ]}
            >
                {children}
            </div>
        </div>
    )
}

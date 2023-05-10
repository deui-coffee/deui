import React, { forwardRef, HTMLAttributes, InputHTMLAttributes, Ref } from 'react'
import tw from 'twin.macro'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

const TextField = forwardRef(function TextField(props: Props, ref: Ref<HTMLInputElement>) {
    return (
        <input
            {...props}
            ref={ref}
            type="text"
            css={[
                tw`
                    appearance-none
                    h-full
                    w-full
                    outline-none
                    rounded-lg
                    text-t0
                    px-4
                    text-center
                    font-medium
                    text-medium-grey
                    bg-white
                    lg:text-dark-grey
                    dark:text-lighter-grey
                    dark:bg-black
                    dark:lg:text-lighter-grey
                    dark:placeholder:text-heavy-grey
                `,
            ]}
        />
    )
})

export default TextField

export function TextFieldDecorator(props: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            {...props}
            css={[
                tw`
                    w-full
                    h-full
                    before:(
                        content-['']
                        w-5
                        h-10
                        absolute
                        top-1/2
                        left-4
                        -translate-y-1/2
                        bg-gradient-to-r
                        to-[rgba(255, 255, 255, 0)]
                        from-[rgba(255, 255, 255, 1)]
                        dark:to-[rgba(0, 0, 0, 0)]
                        dark:from-[rgba(0, 0, 0, 1)]
                    )
                    after:(
                        content-['']
                        w-5
                        h-10
                        absolute
                        top-1/2
                        right-4
                        -translate-y-1/2
                        bg-gradient-to-l
                        to-[rgba(255, 255, 255, 0)]
                        from-[rgba(255, 255, 255, 1)]
                        dark:to-[rgba(0, 0, 0, 0)]
                        dark:from-[rgba(0, 0, 0, 1)]
                    )
                `,
            ]}
        />
    )
}

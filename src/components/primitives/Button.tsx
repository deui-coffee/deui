import { css } from '@emotion/react'
import React, { ButtonHTMLAttributes } from 'react'
import tw from 'twin.macro'

export enum ButtonTheme {
    None,
    Default,
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    theme?: ButtonTheme
}

export default function Button({ type = 'button', theme = ButtonTheme.Default, ...props }: Props) {
    return (
        <button
            {...props}
            css={[
                css`
                    -webkit-tap-highlight-color: transparent;
                `,
                tw`
                    rounded-lg
                    appearance-none
                    outline-none
                    flex
                    h-full
                    items-center
                    justify-center
                    text-[1.25rem]
                    w-full
                    font-medium
                    relative
                    disabled:cursor-default
                `,
                theme === ButtonTheme.Default &&
                    tw`
                        text-medium-grey
                        lg:(bg-white text-dark-grey)
                        dark:text-medium-grey
                        dark:lg:(bg-darkish-grey text-lighter-grey)
                    `,
            ]}
            type={type}
        />
    )
}

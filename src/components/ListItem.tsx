import { css } from '@emotion/react'
import React, { ButtonHTMLAttributes, useEffect, useRef } from 'react'
import tw from 'twin.macro'

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'type'> & {
    id: string
    onClick?: (id: string) => void
    active?: boolean
}

export default function ListItem({
    id,
    children,
    onClick: onClickProp,
    active = false,
    ...props
}: Props) {
    const idRef = useRef(id)

    useEffect(() => {
        idRef.current = id
    }, [id])

    const onClickRef = useRef(onClickProp)

    useEffect(() => {
        onClickRef.current = onClickProp
    }, [onClickProp])

    const { current: onClick } = useRef(() => {
        if (typeof onClickRef.current === 'function') {
            onClickRef.current(idRef.current)
        }
    })

    return (
        <button
            {...props}
            onClick={onClick}
            type="button"
            css={[
                css`
                    -webkit-tap-highlight-color: transparent;
                `,
                tw`
                    appearance-none
                    text-t1
                    h-16
                    w-full
                    text-left
                    text-light-grey
                    dark:text-medium-grey
                    px-14
                    relative
                    font-medium
                `,
                active === true &&
                    tw`
                        text-dark-grey
                        dark:text-lighter-grey
                    `,
            ]}
        >
            <div
                css={[
                    tw`
                        absolute
                        invisible
                        left-0
                        h-6
                        w-1
                        bg-dark-grey
                        dark:bg-lighter-grey
                        top-1/2
                        -translate-y-1/2
                    `,
                    active && tw`visible`,
                ]}
            />
            {children}
        </button>
    )
}

import React, { HTMLAttributes } from 'react'
import { css } from '@emotion/react'
import tw from 'twin.macro'

interface ItemProps extends HTMLAttributes<HTMLSpanElement> {
    active?: boolean
}

function Item({ active = false, ...props }: ItemProps) {
    return (
        <span
            {...props}
            css={[
                css`
                    transition: 200ms ease-out;
                    transition-property: visibility, opacity;
                    transition-delay: 100ms, 0s;
                `,
                tw`
                    absolute
                    invisible
                    opacity-0
                    whitespace-nowrap
                `,
                active &&
                    tw`
                        visible
                        opacity-100
                    `,
                active &&
                    css`
                        transition-delay: 200ms;
                        transition-timing-function: ease-in;
                    `,
            ]}
        />
    )
}

interface Props<T> {
    items?: ([T] | [T, string])[]
    value?: T
}

export default function TextSwitch<T extends number | string>({ items = [], value }: Props<T>) {
    return (
        <>
            &zwnj;
            {items.map(([id, label]) => (
                <Item key={id} active={id === value}>
                    {label || id}
                </Item>
            ))}
        </>
    )
}

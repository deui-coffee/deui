import React, { useEffect, useState, useRef, ButtonHTMLAttributes } from 'react'
import tw from 'twin.macro'
import { css } from '@emotion/react'
import StatusIndicator, { Status } from './StatusIndicator'

type Props = {
    labels?: string[]
    value?: boolean
    onChange?: (arg0: boolean) => void
    status?: Status | ((arg0: boolean) => Status)
    reverse?: boolean
}

export default function Toggle({
    labels: [offLabel = 'Off', onLabel = 'On'] = [],
    value: valueProp = false,
    onChange,
    status: statusProp,
    reverse = false,
}: Props) {
    const [value, setValue] = useState<boolean>(valueProp)

    const lineup = reverse ? [1, 0] : [0, 1]

    const status = typeof statusProp === 'function' ? statusProp(value) : statusProp || Status.None

    useEffect(() => {
        setValue(valueProp)
    }, [valueProp])

    const onChangeRef = useRef(onChange)

    useEffect(() => {
        onChangeRef.current = onChange
    }, [onChange])

    const commitTimeoutRef = useRef<number | undefined>()

    useEffect(
        () => () => {
            clearTimeout(commitTimeoutRef.current)
            commitTimeoutRef.current = undefined
        },
        []
    )

    function onItemClick(newValue: boolean) {
        setValue(newValue)

        clearTimeout(commitTimeoutRef.current)

        commitTimeoutRef.current = window.setTimeout(() => {
            if (typeof onChangeRef.current === 'function') {
                onChangeRef.current(newValue)
            }
        }, 500)
    }

    return (
        <div
            css={[
                tw`
                    h-full
                    relative
                    -mx-1
                `,
            ]}
        >
            <div tw="h-full w-full absolute pointer-events-none z-10">
                <div
                    css={[
                        tw`
                            duration-200
                            ease-linear
                            h-full
                            transition-transform
                            w-1/2
                            px-1
                        `,
                        value !== reverse && tw`translate-x-full`,
                    ]}
                >
                    <div css={[tw`relative w-full h-full`]}>
                        <StatusIndicator css={[tw`absolute right-2 top-2`]} value={status} />
                        <div
                            css={[
                                tw`
                                    bg-off-white
                                    dark:bg-darkish-grey
                                    flex
                                    h-full
                                    items-center
                                    justify-center
                                    rounded-md
                                    md:bg-white
                                    md:border
                                    dark:border-0
                                    md:border-lighter-grey
                                `,
                            ]}
                        >
                            &zwnj;
                            {lineup.map((v) => (
                                <span
                                    key={v}
                                    css={[
                                        tw`
                                            text-[1.25rem]
                                            text-dark-grey
                                            dark:text-lighter-grey
                                            font-medium
                                            absolute
                                            transition-opacity
                                            duration-200
                                        `,
                                        value === Boolean(v) ? tw`opacity-100` : tw`opacity-0`,
                                    ]}
                                >
                                    {v ? onLabel : offLabel}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div tw="flex h-full">
                {lineup.map((v) => (
                    <div
                        key={v}
                        css={[
                            tw`
                                flex-zz-half
                                h-full
                                px-1
                            `,
                        ]}
                    >
                        <Item onClick={onItemClick} value={Boolean(v)}>
                            {v ? onLabel : offLabel}
                        </Item>
                    </div>
                ))}
            </div>
        </div>
    )
}

type ItemProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onClick' | 'type'> & {
    onClick?: (arg0: boolean) => void
    value?: boolean
}

function Item({ value = false, children, onClick, ...props }: ItemProps) {
    return (
        <button
            {...props}
            css={[
                css`
                    -webkit-tap-highlight-color: transparent;
                `,
                tw`
                    text-[1.25rem]
                    appearance-none
                    outline-none
                    w-full
                    h-full
                `,
            ]}
            type="button"
            onClick={() => {
                if (typeof onClick === 'function') {
                    onClick(value)
                }
            }}
        >
            <div
                css={[
                    tw`
                        text-light-grey
                        dark:text-medium-grey
                        duration-200
                        ease-linear
                        flex
                        h-full
                        items-center
                        justify-center
                        rounded-md
                        font-medium
                    `,
                ]}
            >
                {children}
            </div>
        </button>
    )
}

import React, { ButtonHTMLAttributes } from 'react'
import tw from 'twin.macro'
import StatusIndicator, { Status } from './StatusIndicator'
import Button, { ButtonTheme } from './primitives/Button'

type Props = {
    labels?: string[]
    value?: boolean
    onChange?: (arg0: boolean) => void
    status?: Status
    reverse?: boolean
}

export default function Toggle({
    labels: [offLabel = 'Off', onLabel = 'On'] = [],
    value = false,
    onChange,
    status = Status.None,
    reverse = false,
}: Props) {
    const lineup = reverse ? [1, 0] : [0, 1]

    function onItemClick(newValue: boolean) {
        if (typeof onChange === 'function') {
            onChange(newValue)
        }
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
            <div
                css={[
                    tw`
                        h-full
                        w-full
                        absolute
                        pointer-events-none
                        z-10
                    `,
                ]}
            >
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
                        value !== reverse &&
                            tw`
                                translate-x-full
                            `,
                    ]}
                >
                    <div
                        css={[
                            tw`
                                relative
                                w-full
                                h-full
                            `,
                        ]}
                    >
                        <StatusIndicator value={status} />
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

function Item({ value = false, onClick, ...props }: ItemProps) {
    return (
        <Button
            {...props}
            onClick={() => {
                if (typeof onClick === 'function') {
                    onClick(value)
                }
            }}
            theme={ButtonTheme.None}
            css={[
                tw`
                    text-light-grey
                    dark:text-medium-grey
                `,
            ]}
        />
    )
}

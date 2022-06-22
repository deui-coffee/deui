import React, { useEffect, useState } from 'react'
import tw from 'twin.macro'
import { css } from '@emotion/react'
import StatusIndicator, { Status } from './StatusIndicator'

export interface Option {
    value: string
    label: string
}

type Props = {
    onChange?: (arg0: string | undefined) => void
    options?: Option[]
    placeholder?: string
    status?: Status
    value?: string | undefined
}

export default function Select({
    onChange,
    options = [],
    placeholder = 'Select',
    status: statusProp = Status.None,
    value: valueProp,
}: Props) {
    const [value, setValue] = useState<string | undefined>()

    useEffect(() => {
        setValue(valueProp)
    }, [valueProp])

    const selectedOption = options.find((option) => option.value === value)

    function onClick() {
        const [{ value: newValue = undefined }] = typeof value === 'undefined' ? options : [{}]

        setValue(newValue)

        if (typeof onChange === 'function') {
            onChange(newValue)
        }

        // @TODO Drawer
    }

    const status = selectedOption ? statusProp : Status.None

    return (
        <div
            css={[
                tw`
                    relative
                    h-full
                    w-full
                    rounded-lg
                    md:(border border-lighter-grey bg-white)
                    dark:md:(border-0 bg-darkish-grey)
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
                        md:(text-dark-grey)
                        dark:(text-medium-grey)
                        dark:md:(text-lighter-grey)
                    `,
                    !!selectedOption &&
                        tw`
                            text-dark-grey
                            dark:(text-lighter-grey)
                            dark:md:(text-lighter-grey)
                        `,
                ]}
                type="button"
                onClick={onClick}
            >
                {selectedOption ? selectedOption.label : placeholder}
            </button>
        </div>
    )
}

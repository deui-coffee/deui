import React, { useEffect, useState } from 'react'
import tw from 'twin.macro'
import { css } from '@emotion/react'
import StatusIndicator, { Status } from './StatusIndicator'
import Button from './primitives/Button'
import DrawerContext from '$/contexts/DrawerContext'

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
                    lg:(border border-lighter-grey bg-white)
                    dark:lg:(border-0 bg-darkish-grey)
                `,
            ]}
        >
            <StatusIndicator value={status} />
            <Button
                onClick={onClick}
                css={[
                    !!selectedOption &&
                        tw`
                            text-dark-grey
                            dark:text-lighter-grey
                            dark:lg:text-lighter-grey
                        `,
                ]}
            >
                {selectedOption ? selectedOption.label : placeholder}
            </Button>
        </div>
    )
}

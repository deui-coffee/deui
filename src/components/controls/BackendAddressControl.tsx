import { usePhase, useStatus } from '$/stores/data'
import React, { useRef } from 'react'
import tw from 'twin.macro'
import Control, { ControlProps } from '../Control'
import StatusIndicator from '../StatusIndicator'
import TextField, { TextFieldDecorator } from '../primitives/TextField'
import { useServerUrl } from '$/hooks'

type Props = Omit<ControlProps, 'fill' | 'pad'>

export default function BackendAddressControl({ label = 'Connection', ...props }: Props) {
    const phase = usePhase()

    const status = useStatus()

    const fieldRef = useRef<HTMLInputElement>(null)

    const url = useServerUrl({ protocol: 'ws' }).replace(/^ws:\/\//, '')

    return (
        <Control
            {...props}
            label={
                <>
                    <span>{label}</span>
                    {phase && (
                        <span
                            {...props}
                            css={[
                                tw`
                                    tracking-normal
                                    normal-case
                                    text-medium-grey
                                    text-[0.75rem]
                                `,
                            ]}
                        >
                            {phase}
                        </span>
                    )}
                </>
            }
        >
            <TextFieldDecorator>
                <StatusIndicator
                    value={status}
                    idleCss={tw`
                        text-[#ddd]
                        dark:text-dark-grey
                    `}
                />
                <TextField
                    ref={fieldRef}
                    defaultValue={url}
                    readOnly
                    css={tw`
                        cursor-default
                    `}
                />
            </TextFieldDecorator>
        </Control>
    )
}

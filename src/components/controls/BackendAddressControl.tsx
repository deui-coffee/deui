import { BackendAction } from '$/features/backend'
import { MiscAction } from '$/features/misc'
import useBackendUrl from '$/hooks/useBackendUrl'
import useIsEditingBackendUrl from '$/hooks/useIsEditingBackendUrl'
import { css } from '@emotion/react'
import React, { ButtonHTMLAttributes, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import tw from 'twin.macro'
import Control, { ControlProps } from '../Control'
import Button, { ButtonTheme } from '../primitives/Button'
import TextField, { TextFieldDecorator } from '../primitives/TextField'
import StatusIndicator, { Status } from '../StatusIndicator'

export default function BackendAddressControl({ label = 'Backend URL', ...props }: ControlProps) {
    const backendUrl = useBackendUrl()

    const [value, setValue] = useState<string>(backendUrl)

    useEffect(() => {
        setValue(backendUrl)
    }, [backendUrl])

    const canConnect = !!value && !/\s/.test(value)

    const isConnecting = false

    const isBusy = isConnecting

    const fieldRef = useRef<HTMLInputElement>(null)

    const dispatch = useDispatch()

    const isEditingBackendUrl = useIsEditingBackendUrl()

    function onConnectClick() {
        dispatch(BackendAction.setUrl(value))
    }

    function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Escape') {
            dispatch(MiscAction.setIsEditingBackendUrl(false))
            setValue(backendUrl)

            if (fieldRef.current) {
                fieldRef.current.blur()
            }

            e.stopPropagation()
        }
    }

    return (
        <>
            <Control
                {...props}
                label={
                    <>
                        <span>{label}</span>
                        {isConnecting && (
                            <span
                                css={[
                                    tw`
                                        tracking-normal
                                        normal-case
                                        text-medium-grey
                                        text-[0.75rem]
                                    `,
                                ]}
                            >
                                Connecting…
                            </span>
                        )}
                    </>
                }
            >
                <TextFieldDecorator>
                    <StatusIndicator
                        value={isBusy ? Status.Busy : Status.Idle}
                        idleCss={tw`
                            text-[#ddd]
                            dark:text-dark-grey
                        `}
                    />
                    <TextField
                        ref={fieldRef}
                        placeholder="Eg. 192.168.1.1:5000"
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value)
                        }}
                        onFocus={() => {
                            dispatch(MiscAction.setIsEditingBackendUrl(true))
                        }}
                        onKeyDown={onKeyDown}
                    />
                </TextFieldDecorator>
            </Control>
            {isEditingBackendUrl && (
                <Control>
                    <div
                        css={[
                            tw`
                                flex
                                items-center
                                h-16
                            `,
                        ]}
                    >
                        <div
                            css={[
                                css`
                                    flex-basis: 50%;
                                `,
                                tw`
                                    pr-2
                                    h-full
                                `,
                            ]}
                        >
                            <SecondaryButton
                                onClick={() => {
                                    dispatch(MiscAction.setIsEditingBackendUrl(false))
                                    setValue(backendUrl)
                                }}
                            >
                                Cancel
                            </SecondaryButton>
                        </div>
                        <div
                            css={[
                                css`
                                    flex-basis: 50%;
                                `,
                                tw`
                                    pl-2
                                    h-full
                                `,
                            ]}
                        >
                            <PrimaryButton disabled={!canConnect} onClick={onConnectClick}>
                                Connect
                            </PrimaryButton>
                        </div>
                    </div>
                </Control>
            )}
        </>
    )
}

function PrimaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <Button
            {...props}
            theme={ButtonTheme.None}
            css={[
                tw`
                    bg-offish-white
                    dark:bg-darkish-grey
                    dark:text-lighter-grey
                    disabled:text-medium-grey
                `,
            ]}
        />
    )
}

function SecondaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <Button
            {...props}
            theme={ButtonTheme.None}
            css={[
                css`
                    background: none !important;
                `,
                tw`
                    text-dark-grey
                    dark:text-light-grey
                    disabled:text-medium-grey
                `,
            ]}
        />
    )
}

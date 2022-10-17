import { BackendAction } from '$/features/backend'
import { MiscAction } from '$/features/misc'
import { Flag } from '$/features/misc/types'
import useBackendUrl from '$/hooks/useBackendUrl'
import useIsEditingBackendUrl from '$/hooks/useIsEditingBackendUrl'
import { css } from '@emotion/react'
import React, { ButtonHTMLAttributes, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import tw from 'twin.macro'
import Control, { ControlProps } from '../Control'
import Button, { ButtonTheme } from '../primitives/Button'
import Form from '../primitives/Form'
import TextField, { TextFieldDecorator } from '../primitives/TextField'
import StatusIndicator from '../StatusIndicator'
import useBackendConnectionStatus from '$/hooks/useBackendConnectionStatus'
import useBackendState from '$/hooks/useBackendState'
import useFlag from '$/hooks/useFlag'
import { CafeHubState } from 'cafehub-client/types'

type Props = Omit<ControlProps, 'fill' | 'pad'>

export default function BackendAddressControl({ label = 'Backend URL', ...props }: Props) {
    const backendUrl = useBackendUrl()

    const [value, setValue] = useState<string>(backendUrl)

    useEffect(() => {
        setValue(backendUrl)
    }, [backendUrl])

    const status = useBackendConnectionStatus()

    const backendState = useBackendState()

    const canConnect = !!value && !/\s/.test(value) && backendState === CafeHubState.Disconnected

    const fieldRef = useRef<HTMLInputElement>(null)

    const dispatch = useDispatch()

    const isEditingBackendUrl = useIsEditingBackendUrl()

    const isBeingConnected = useFlag(Flag.IsConnectingToBackend)

    const isBeingDisconnected = useFlag(Flag.IsDisconnectingToBackend)

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
        <Form
            onSubmit={() => {
                dispatch(
                    BackendAction.connect({
                        flag: Flag.IsConnectingToBackend,
                        url: value,
                    })
                )
            }}
        >
            <Control
                {...props}
                label={
                    <>
                        <span>{label}</span>
                        {backendState === CafeHubState.Connecting && (
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
                        value={status}
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
                        readOnly={!canConnect}
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

                                    if (
                                        isBeingConnected ||
                                        backendState === CafeHubState.Connecting
                                    ) {
                                        dispatch(BackendAction.abort())
                                    }
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
                            {(backendState === CafeHubState.Connected || isBeingDisconnected) &&
                            !isBeingConnected ? (
                                <PrimaryButton
                                    key="dc"
                                    disabled={isBeingDisconnected}
                                    onClick={() => {
                                        dispatch(
                                            BackendAction.disconnect({
                                                flag: Flag.IsDisconnectingToBackend,
                                            })
                                        )
                                    }}
                                >
                                    Disconnect
                                </PrimaryButton>
                            ) : (
                                <PrimaryButton
                                    disabled={!canConnect}
                                    onClick={onConnectClick}
                                    type="submit"
                                >
                                    Connect
                                </PrimaryButton>
                            )}
                        </div>
                    </div>
                </Control>
            )}
        </Form>
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

import { css } from '@emotion/react'
import React, { ButtonHTMLAttributes, KeyboardEvent, useRef, useState } from 'react'
import tw from 'twin.macro'
import Control, { ControlProps } from '../Control'
import Button, { ButtonTheme } from '../primitives/Button'
import Form from '../primitives/Form'
import TextField, { TextFieldDecorator } from '../primitives/TextField'
import StatusIndicator, { Status } from '../StatusIndicator'
import { WebSocketState, useCafeHubStatus, useCafeHubStore } from '$/stores/ch'
import { StorageKey } from '$/types'
import { useUiStore } from '$/stores/ui'

type Props = Omit<ControlProps, 'fill' | 'pad'>

export default function BackendAddressControl({ label = 'Backend URL', ...props }: Props) {
    const [backendUrl, setBackendUrl] = useState(localStorage.getItem(StorageKey.BackendUrl) || '')

    const { isEditingBackendUrl, setIsEditingBackendUrl } = useUiStore()

    const { connect, disconnect, wsState, phase = null } = useCafeHubStore()

    const status = useCafeHubStatus()

    const fieldRef = useRef<HTMLInputElement>(null)

    function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Escape') {
            setIsEditingBackendUrl(false)

            setBackendUrl(localStorage.getItem(StorageKey.BackendUrl) || '')

            if (fieldRef.current) {
                fieldRef.current.blur()
            }

            e.stopPropagation()
        }
    }

    const canConnect = wsState === WebSocketState.Closed && !!backendUrl && !/\s/.test(backendUrl)

    return (
        <Form
            onSubmit={async () => {
                if (!canConnect) {
                    return
                }

                setIsEditingBackendUrl(false)

                localStorage.setItem(StorageKey.BackendUrl, backendUrl)

                try {
                    await connect(backendUrl)
                } catch (e) {
                    console.warn('Failed to connect', e)
                }
            }}
        >
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
                        placeholder="Eg. ws://192.168.1.1:8765"
                        value={backendUrl}
                        onChange={({ target }) => {
                            setBackendUrl(target.value)
                        }}
                        onFocus={() => {
                            setIsEditingBackendUrl(true)
                        }}
                        onKeyDown={onKeyDown}
                        readOnly={wsState !== WebSocketState.Closed}
                    />
                </TextFieldDecorator>
            </Control>
            {isEditingBackendUrl && (
                <Control>
                    <div
                        {...props}
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
                                disabled={status === Status.On || status === Status.Off}
                                onClick={() => void disconnect()}
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
                            {status === Status.Off && (
                                <PrimaryButton key="connect" disabled={!canConnect} type="submit">
                                    Connect
                                </PrimaryButton>
                            )}
                            {status === Status.On && (
                                <PrimaryButton
                                    key="disconnect"
                                    onClick={() => {
                                        disconnect()
                                        setIsEditingBackendUrl(false)
                                    }}
                                >
                                    Disconnect
                                </PrimaryButton>
                            )}
                            {status !== Status.On && status !== Status.Off && (
                                <PrimaryButton key="inactiveConnect" disabled>
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

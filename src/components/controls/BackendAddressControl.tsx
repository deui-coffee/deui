import { MiscAction } from '$/features/misc'
import useIsEditingBackendUrl from '$/hooks/useIsEditingBackendUrl'
import { css } from '@emotion/react'
import React, { ButtonHTMLAttributes, HTMLAttributes, KeyboardEvent, useRef } from 'react'
import { useDispatch } from 'react-redux'
import tw from 'twin.macro'
import Control, { ControlProps } from '../Control'
import Button, { ButtonTheme } from '../primitives/Button'
import Form from '../primitives/Form'
import TextField, { TextFieldDecorator } from '../primitives/TextField'
import StatusIndicator from '../StatusIndicator'
import useCafeHubPhase from '$/hooks/useCafeHubPhase'
import { Phase, Property } from '$/features/cafehub/types'
import { CafeHubAction } from '$/features/cafehub'
import useTransientBackendUrl from '$/hooks/useTransientBackendUrl'
import useCafeHubPhaseStatus from '$/hooks/useCafeHubPhaseStatus'
import useProperty from '$/hooks/useProperty'

type Props = Omit<ControlProps, 'fill' | 'pad'>

export default function BackendAddressControl({ label = 'Backend URL', ...props }: Props) {
    const backendUrl = useTransientBackendUrl()

    const chPhase = useCafeHubPhase()

    const status = useCafeHubPhaseStatus()

    const canConnect = !!backendUrl && !/\s/.test(backendUrl) && chPhase === Phase.Disconnected

    const fieldRef = useRef<HTMLInputElement>(null)

    const dispatch = useDispatch()

    const isEditingBackendUrl = useIsEditingBackendUrl()

    function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Escape') {
            dispatch(MiscAction.setIsEditingBackendUrl(false))

            dispatch(MiscAction.setTransientBackendUrl(undefined))

            if (fieldRef.current) {
                fieldRef.current.blur()
            }

            e.stopPropagation()
        }
    }

    return (
        <Form
            onSubmit={() => {
                if (canConnect) {
                    dispatch(CafeHubAction.connect(backendUrl))
                }
            }}
        >
            <Control
                {...props}
                label={
                    <>
                        <span>{label}</span>
                        <PhaseLabel phase={chPhase} />
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
                        value={backendUrl}
                        onChange={(e) => {
                            dispatch(MiscAction.setTransientBackendUrl(e.target.value))
                        }}
                        onFocus={() => {
                            dispatch(MiscAction.setIsEditingBackendUrl(true))
                        }}
                        onKeyDown={onKeyDown}
                        readOnly={chPhase !== Phase.Disconnected}
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
                                disabled={[
                                    Phase.Paired,
                                    Phase.Pairing,
                                    Phase.Disconnecting,
                                ].includes(chPhase)}
                                onClick={() => {
                                    dispatch(CafeHubAction.abort())
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
                            <RightAction disabled={!canConnect} />
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

interface PhaseLabelProps extends HTMLAttributes<HTMLSpanElement> {
    phase: Phase
}

function PhaseLabel({ phase, ...props }: PhaseLabelProps) {
    let label

    switch (phase) {
        case Phase.Connecting:
            label = 'Connecting…'
            break
        case Phase.Pairing:
            label = 'Pairing…'
            break
        case Phase.Scanning:
            label = 'Scanning…'
            break
        case Phase.Disconnecting:
            label = 'Disconnecting…'
            break
        default:
            return null
    }

    return (
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
            {label}
        </span>
    )
}

interface RightActionProps {
    disabled?: boolean
}

function RightAction({ disabled = false }: RightActionProps) {
    const chPhase = useCafeHubPhase()

    const dispatch = useDispatch()

    switch (chPhase) {
        case Phase.Disconnected:
            return (
                <PrimaryButton key={chPhase} disabled={disabled} type="submit">
                    Connect
                </PrimaryButton>
            )
        case Phase.Unscanned:
            return (
                <PrimaryButton
                    key={chPhase}
                    onClick={() => {
                        dispatch(CafeHubAction.scan())
                    }}
                >
                    Scan again
                </PrimaryButton>
            )
        case Phase.Unpaired:
            return (
                <PrimaryButton
                    key={chPhase}
                    onClick={() => {
                        dispatch(CafeHubAction.pair())
                    }}
                >
                    Pair again
                </PrimaryButton>
            )
        case Phase.Paired:
            return (
                <PrimaryButton
                    key={chPhase}
                    onClick={() => {
                        dispatch(CafeHubAction.unpair())
                    }}
                >
                    Disconnect
                </PrimaryButton>
            )
        default:
            return (
                <PrimaryButton key={chPhase} disabled>
                    Connect
                </PrimaryButton>
            )
    }
}

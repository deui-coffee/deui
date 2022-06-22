import PrewrappedControl, { ControlProps } from '$/components/Control'
import { css } from '@emotion/react'
import React from 'react'
import tw from 'twin.macro'

export default function Controller() {
    return (
        <div
            css={[
                tw`
                    max-w-[974px]
                    w-full
                `,
            ]}
        >
            <div
                css={[
                    css`
                        > * {
                            flex-basis: 50%;
                        }
                    `,
                    tw`
                        flex
                        -mx-4
                    `,
                ]}
            >
                <div css={[tw`px-4`]}>
                    <Control label="Function" />
                </div>
                <div css={[tw`px-4`]}>
                    <Control label="Profile" />
                </div>
            </div>
            <div css={[tw`mt-8`]}>
                <Control />
            </div>
        </div>
    )
}

function Control(props: ControlProps) {
    return (
        <PrewrappedControl
            {...props}
            fill
            css={[
                tw`
                    border
                    border-lighter-grey
                    md:h-[144px]
                    dark:border-0
                `,
            ]}
        />
    )
}

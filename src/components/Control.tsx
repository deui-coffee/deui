import React, { HTMLAttributes, ReactNode } from 'react'
import tw from 'twin.macro'
import Label from './Label'

export type ControlProps = {
    label?: ReactNode
    fill?: boolean
    pad?: boolean
}

type Props = ControlProps & HTMLAttributes<HTMLDivElement>

export default function Control({ label, fill = false, pad = false, ...props }: Props) {
    return (
        <div
            css={[
                tw`
                    [* + &]:mt-4
                `,
            ]}
        >
            {!!label && <Label>{label}</Label>}
            <div
                {...props}
                css={[
                    tw`
                        h-[5.5rem]
                        lg:h-[5rem]
                        relative
                        rounded-lg
                    `,
                    fill && tw`bg-white dark:bg-black`,
                    pad && tw`p-2`,
                ]}
            />
        </div>
    )
}

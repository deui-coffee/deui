import React, { forwardRef, HTMLAttributes, ReactNode, Ref } from 'react'
import tw from 'twin.macro'
import Label from './primitives/Label'

export type ControlProps = {
    label?: ReactNode
    fill?: boolean
    pad?: boolean
}

type Props = ControlProps & HTMLAttributes<HTMLDivElement>

const Control = forwardRef(function Control(
    { label, fill = false, pad = false, ...props }: Props,
    ref: Ref<HTMLDivElement>
) {
    return (
        <div
            ref={ref}
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
                        relative
                        rounded-lg
                    `,
                    fill && tw`bg-white dark:bg-black`,
                    pad && tw`p-2`,
                ]}
            />
        </div>
    )
})

export default Control

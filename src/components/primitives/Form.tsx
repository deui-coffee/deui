import React, { FormEvent, FormHTMLAttributes } from 'react'

type Props = Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> & {
    onSubmit?: () => void
}

export default function Form({ onSubmit: onSubmitProp, ...props }: Props) {
    function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (typeof onSubmitProp === 'function') {
            onSubmitProp()
        }
    }

    return <form {...props} onSubmit={onSubmit} />
}

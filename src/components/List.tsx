import React, { Children, ReactNode } from 'react'

type Props = {
    children?: ReactNode
}

export default function List({ children }: Props) {
    return (
        <ul>
            {Children.map(children, (child) => (
                <li>{child}</li>
            ))}
        </ul>
    )
}

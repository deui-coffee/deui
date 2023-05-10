import React from 'react'
import Control, { ControlProps } from '../Control'
import ThemeToggle from '$/components/ui/ThemeToggle'

export default function ThemeControl({ label = 'Theme', ...props }: ControlProps) {
    return (
        <Control {...props} label={label}>
            <ThemeToggle />
        </Control>
    )
}

import React from 'react'
import { MiscAction } from '$/features/misc'
import useTheme from '$/hooks/useTheme'
import { Theme } from '$/types'
import { useDispatch } from 'react-redux'
import Control, { ControlProps } from '../Control'
import Toggle from '../Toggle'

const labels = ['Light', 'Dark']

export default function ThemeControl({ label = 'Theme', ...props }: ControlProps) {
    const dispatch = useDispatch()

    const isDark = useTheme() === Theme.Dark

    return (
        <Control {...props} label={label}>
            <Toggle
                onChange={(state) => void dispatch(MiscAction.setDarkTheme(state))}
                labels={labels}
                value={isDark}
            />
        </Control>
    )
}

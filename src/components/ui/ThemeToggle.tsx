import React from 'react'
import Toggle from '$/components/Toggle'
import { MiscAction } from '$/features/misc'
import useTheme from '$/hooks/useTheme'
import { Theme } from '$/types'
import { useDispatch } from 'react-redux'

const labels = ['Light', 'Dark']

export default function ThemeToggle() {
    const dispatch = useDispatch()

    const isDark = useTheme() === Theme.Dark

    return (
        <Toggle
            onChange={(state) => void dispatch(MiscAction.setDarkTheme(state))}
            labels={labels}
            value={isDark}
        />
    )
}

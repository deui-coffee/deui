import React from 'react'
import Toggle from '$/components/Toggle'
import { Theme } from '$/types'
import { useUiStore } from '$/stores/ui'

const labels = ['Light', 'Dark']

export default function ThemeToggle() {
    const { theme, setTheme } = useUiStore()

    return (
        <Toggle
            onChange={(state) => {
                if (state) {
                    return void setTheme(Theme.Dark)
                }

                setTheme(Theme.Light)
            }}
            labels={labels}
            value={theme === Theme.Dark}
        />
    )
}

import React from 'react'
import { useDispatch } from 'react-redux'
import { UiAction } from '../../features/ui'
import { useTheme } from '../../features/ui/hooks'
import { Theme } from '../../features/ui/types'
import Control from '../Control'
import Toggle from '../Toggle'

export default function ThemeControl() {
    const dispatch = useDispatch()

    const theme = useTheme()

    return (
        <Control label="Theme">
            <Toggle
                onChange={(newTheme) => void dispatch(UiAction.setTheme(newTheme as Theme))}
                options={[
                    [Theme.Dark as string, 'Dark'],
                    [Theme.Light as string, 'Light'],
                ]}
                value={theme}
            />
        </Control>
    )
}

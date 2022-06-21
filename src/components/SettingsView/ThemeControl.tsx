import { MiscAction } from '$/features/misc'
import useTheme from '$/hooks/useTheme'
import { Theme } from '$/types'
import React from 'react'
import { useDispatch } from 'react-redux'
import Control from '../Control'
import Toggle from '../Toggle'

export default function ThemeControl() {
    const dispatch = useDispatch()

    const theme = useTheme()

    return (
        <Control label="Theme">
            <Toggle
                onChange={(newTheme) =>
                    void dispatch(MiscAction.setDarkTheme(newTheme === Theme.Dark))
                }
                options={[
                    [Theme.Dark as string, 'Dark'],
                    [Theme.Light as string, 'Light'],
                ]}
                value={theme}
            />
        </Control>
    )
}

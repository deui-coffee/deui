import React from 'react'
import { Helmet } from 'react-helmet'
import 'twin.macro'
import tw from 'twin.macro'
import GlobalStyles from './GlobalStyles'
import useTheme from '$/hooks/useTheme'
import ProfilesDrawer from '$/components/drawers/ProfilesDrawer'
import BLEDrawer from '$/components/drawers/BLEDrawer'
import WideView from './components/WideView'
import SettingsDrawer from './components/drawers/SettingsDrawer'
import useAutoConnectEffect from './hooks/useAutoConnectEffect'
import usePreventNavigatingAwayEffect from '$/hooks/usePreventNavigatingAwayEffect'
import Debug from '$/components/ui/Debug'
import NarrowView from '$/components/NarrowView'

const App = () => {
    const theme = useTheme()

    useAutoConnectEffect()

    usePreventNavigatingAwayEffect()

    return (
        <>
            <Helmet>
                <html className={theme} />
            </Helmet>
            <GlobalStyles />
            <div
                css={[
                    tw`
                        h-screen
                        w-screen
                    `,
                ]}
            >
                <WideView tw="hidden lg:block" />
                <Debug />
                <NarrowView tw="lg:hidden" />
            </div>
            <ProfilesDrawer />
            <BLEDrawer />
            <SettingsDrawer />
        </>
    )
}

export default App

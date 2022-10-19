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
import useBackendStateEffect from '$/hooks/useBackendStateEffect'
import useCharChangeEffect from '$/hooks/useCharChangeEffect'

const App = () => {
    const theme = useTheme()

    useAutoConnectEffect()

    useBackendStateEffect()

    useCharChangeEffect()

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
                {/* <Viewport tw="lg:hidden" /> */}
            </div>
            <ProfilesDrawer />
            <BLEDrawer />
            <SettingsDrawer />
        </>
    )
}

export default App

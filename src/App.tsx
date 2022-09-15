import React from 'react'
import { Helmet } from 'react-helmet'
import 'twin.macro'
import tw from 'twin.macro'
import GlobalStyles from './GlobalStyles'
import useTheme from '$/hooks/useTheme'
import ProfilesDrawer from '$/components/ProfilesDrawer'
import BLEDrawer from '$/components/BLEDrawer'
import useCafeHubClientStateEffect from '$/hooks/useCafeHubClientStateEffect'
import WideView from './components/WideView'
import SettingsDrawer from './components/SettingsDrawer'

const App = () => {
    const theme = useTheme()

    useCafeHubClientStateEffect()

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

import React from 'react'
import { Helmet } from 'react-helmet'
import 'twin.macro'
import tw from 'twin.macro'
import Viewport from './components/Viewport'
import GlobalStyles from './GlobalStyles'
import useTheme from '$/hooks/useTheme'
import ControllerView from '$/components/ControllerView'
import ProfilesDrawer from '$/components/ProfilesDrawer'
import BLEDrawer from '$/components/BLEDrawer'
import useCafeHubClientStateEffect from '$/hooks/useCafeHubClientStateEffect'

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
                <ControllerView tw="hidden lg:block" />
                <Viewport tw="lg:hidden" />
            </div>
            <ProfilesDrawer />
            <BLEDrawer />
        </>
    )
}

export default App

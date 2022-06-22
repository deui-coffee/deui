import React from 'react'
import { Helmet } from 'react-helmet'
import 'twin.macro'
import tw from 'twin.macro'
import Viewport from './components/Viewport'
import GlobalStyles from './GlobalStyles'
import useTheme from '$/hooks/useTheme'
import ControllerView from '$/components/ControllerView'
import ProfilesDrawer from '$/components/ProfilesDrawer'

const App = () => {
    const theme = useTheme()

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
        </>
    )
}

export default App

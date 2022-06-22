import React from 'react'
import { Helmet } from 'react-helmet'
import 'twin.macro'
import tw from 'twin.macro'
import Viewport from './components/Viewport'
import GlobalStyles from './GlobalStyles'
import useTheme from '$/hooks/useTheme'
import ControllerView from '$/components/ControllerView'

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
                <ControllerView tw="hidden md:block" />
                <Viewport tw="md:hidden" />
            </div>
        </>
    )
}

export default App

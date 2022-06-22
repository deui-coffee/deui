import React from 'react'
import { Helmet } from 'react-helmet'
import 'twin.macro'
import tw from 'twin.macro'
import Viewport from './components/Viewport'
import GlobalStyles from './GlobalStyles'
import useTheme from '$/hooks/useTheme'
import ClockView from '$/components/ClockView'

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
                <ClockView tw="hidden md:block" />
                <Viewport tw="md:hidden" />
            </div>
        </>
    )
}

export default App

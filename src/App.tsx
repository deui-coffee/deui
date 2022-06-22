import React from 'react'
import { Helmet } from 'react-helmet'
import 'twin.macro'
import tw from 'twin.macro'
import Viewport from './components/Viewport'
import GlobalStyles from './GlobalStyles'
import useTheme from '$/hooks/useTheme'
import useMediaQuery from '$/hooks/useMediaQuery'
import ClockView from '$/components/ClockView'

const App = () => {
    const theme = useTheme()

    const isTablet = useMediaQuery('(min-width: 768px)')

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
                {isTablet ? <ClockView /> : <Viewport />}
            </div>
        </>
    )
}

export default App

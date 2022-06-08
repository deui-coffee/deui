import React from 'react'
import { Helmet } from 'react-helmet'
import 'twin.macro'
import tw from 'twin.macro'
import Viewport from './components/Viewport'
import GlobalStyles from './GlobalStyles'
import { useTheme } from './hooks/useTheme'
import ViewsProvider from './components/ViewsProvider'

const App = () => {
    const [theme] = useTheme()

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
                <ViewsProvider>
                    <Viewport />
                </ViewsProvider>
            </div>
        </>
    )
}

export default App

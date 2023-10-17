import React from 'react'
import { Helmet } from 'react-helmet'
import 'twin.macro'
import tw from 'twin.macro'
import GlobalStyles from './GlobalStyles'
import WideView from './components/WideView'
import NarrowView from '$/components/NarrowView'
import { Container } from 'toasterhea'
import { Layer } from './types'
import { useUiStore } from './stores/ui'
import { useAutoConnectEffect } from './stores/data'
import Debug from './components/Debug'

const App = () => {
    const { theme } = useUiStore()

    useAutoConnectEffect()

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
                <NarrowView tw="lg:hidden" />
                <Debug />
            </div>
            <Container id={Layer.Drawer} />
        </>
    )
}

export default App

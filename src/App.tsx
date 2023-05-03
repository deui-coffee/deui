import React from 'react'
import { Helmet } from 'react-helmet'
import 'twin.macro'
import tw from 'twin.macro'
import GlobalStyles from './GlobalStyles'
import WideView from './components/WideView'
import usePreventNavigatingAwayEffect from '$/hooks/usePreventNavigatingAwayEffect'
import NarrowView from '$/components/NarrowView'
import { Container } from 'toasterhea'
import { Layer } from './consts'
import { useUiStore } from './stores/ui'
import Debug from './components/ui/Debug'

const App = () => {
    const { theme } = useUiStore()

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
                <NarrowView tw="lg:hidden" />
                <Debug />
            </div>
            <Container id={Layer.Drawer} />
        </>
    )
}

export default App

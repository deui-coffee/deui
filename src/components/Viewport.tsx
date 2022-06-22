import React, { HTMLAttributes } from 'react'
import tw from 'twin.macro'
import { css } from '@emotion/react'
import Page from './Page'
import { useSwipeable } from 'react-swipeable'
import { useDispatch } from 'react-redux'
import { lineup, ViewAction } from '../features/view'
import { useViewId, useViewIndex } from '../features/view/hooks'

const count = lineup.length

export default function Viewport(props: HTMLAttributes<HTMLDivElement>) {
    const dispatch = useDispatch()

    const handlers = useSwipeable({
        preventDefaultTouchmoveEvent: true,
        onSwipedLeft() {
            dispatch(ViewAction.set('next'))
        },
        onSwipedRight() {
            dispatch(ViewAction.set('prev'))
        },
    })

    const index = useViewIndex()

    const viewId = useViewId()

    return (
        <div {...props}>
            {/* Viewport */}
            <div
                {...handlers}
                css={[
                    tw`
                        bg-off-white
                        dark:(bg-dark-grey text-lighter-grey)
                        overflow-hidden
                        relative
                        text-darker-grey
                        w-screen
                    `,
                ]}
            >
                {/* Tape. */}
                <div
                    style={{
                        transform: `translateX(${-index * 100}vw)`,
                        width: `${count * 100}vw`,
                    }}
                    css={[
                        tw`
                            duration-300
                            ease-in-out
                            flex
                            transition-transform
                        `,
                    ]}
                >
                    {/* Frames. */}
                    {lineup.map(({ id, component: ViewComponent }) => (
                        <div
                            key={`${id}`}
                            style={{
                                flex: `0 0 ${100 / count}%`,
                            }}
                        >
                            <Page>
                                <ViewComponent />
                            </Page>
                        </div>
                    ))}
                </div>
            </div>
            {/* View navigation */}
            <ul
                css={[
                    tw`
                        backdrop-blur
                        bg-off-white/30
                        bottom-0
                        dark:bg-dark-grey/30
                        dark:text-lighter-grey
                        fixed
                        flex
                        h-32
                        justify-between
                        left-0
                        px-14
                        py-10
                        w-full
                    `,
                ]}
            >
                {lineup.map(({ id, icon: ViewIcon }) => (
                    <li key={id}>
                        <button
                            type="button"
                            css={[
                                css`
                                    -webkit-tap-highlight-color: transparent;
                                `,
                                tw`
                                    appearance-none
                                    dark:opacity-50
                                    h-12
                                    opacity-25
                                    relative
                                    w-12
                                `,
                                viewId === id &&
                                    tw`
                                        !opacity-100
                                    `,
                            ]}
                            onClick={() => void dispatch(ViewAction.set(id))}
                        >
                            {/* @TODO: StatusIndicator */}
                            <div
                                css={[
                                    tw`
                                        [> svg]:block
                                        bg-white
                                        dark:bg-black
                                        dark:text-medium-grey
                                        flex
                                        h-full
                                        items-center
                                        justify-center
                                        rounded-full
                                        text-darker-grey
                                        w-full
                                    `,
                                    viewId === id &&
                                        tw`
                                            dark:text-lighter-grey
                                        `,
                                ]}
                            >
                                <ViewIcon />
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

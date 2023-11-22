import React, { ReactNode, useEffect, useRef } from 'react'
import tw from 'twin.macro'
import { css } from '@emotion/react'
import { useDataStore } from '$/stores/data'
import axios from 'axios'

export default function ProfilesView() {
    const {
        profiles,
        remoteState: { profileId },
    } = useDataStore()

    return (
        <>
            {profiles.map(({ id, title }) => (
                <Item
                    key={id}
                    id={id}
                    onClick={async () => {
                        await axios.post(`/profile-list/${id}`)
                    }}
                    active={id === profileId}
                >
                    {title}
                </Item>
            ))}
        </>
    )
}

type ItemProps = {
    children?: ReactNode
    id: string
    onClick?: (profileId: string) => void
    active?: boolean
}

function Item({ id, children, onClick: onClickProp, active }: ItemProps) {
    const idRef = useRef(id)

    useEffect(() => {
        idRef.current = id
    }, [id])

    const onClickRef = useRef(onClickProp)

    useEffect(() => {
        onClickRef.current = onClickProp
    }, [onClickProp])

    const { current: onClick } = useRef(() => {
        if (typeof onClickRef.current === 'function') {
            onClickRef.current(idRef.current)
        }
    })

    return (
        <button
            onClick={onClick}
            type="button"
            css={[
                css`
                    -webkit-tap-highlight-color: transparent;
                    grid-template-columns: 4px 1fr;
                    gap: 52px;
                `,
                tw`
                    items-center
                    grid
                    appearance-none
                    text-t1
                    h-16
                    w-full
                    text-left
                    text-light-grey
                    dark:text-medium-grey
                    pr-14
                `,
                active === true &&
                    tw`
                        text-dark-grey
                        dark:text-lighter-grey
                    `,
            ]}
        >
            <div
                css={[
                    tw`
                        invisible
                        h-6
                        w-1
                        bg-dark-grey
                        dark:bg-lighter-grey
                    `,
                    active === true &&
                        tw`
                            visible
                        `,
                ]}
            />
            <div
                css={tw`
                    truncate
                `}
            >
                {children}
            </div>
        </button>
    )
}

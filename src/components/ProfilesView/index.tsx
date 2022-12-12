import React, { ReactNode, useEffect, useRef } from 'react'
import tw from 'twin.macro'
import { css } from '@emotion/react'

export default function Profiles() {
    return <></>
    // const profiles = useProfiles()

    // const selectedProfileId = useSelectedProfileId()

    // const dispatch = useDispatch()

    // return (
    //     <List>
    //         {profiles.map(({ id, label }) => (
    //             <Item
    //                 key={id}
    //                 id={id}
    //                 onClick={(profileId) => void dispatch(MachineAction.selectProfile(profileId))}
    //                 active={selectedProfileId === id}
    //             >
    //                 {label}
    //             </Item>
    //         ))}
    //     </List>
    // )
}

type ItemProps = {
    children?: ReactNode
    id: string
    onClick?: (arg0: string) => void
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
                `,
                tw`
                    appearance-none
                    text-t1
                    h-16
                    w-full
                    text-left
                    text-light-grey
                    dark:text-medium-grey
                    px-14
                    relative
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
                        absolute
                        invisible
                        left-0
                        h-6
                        w-1
                        top-0
                        bg-dark-grey
                        dark:bg-lighter-grey
                        top-1/2
                        -translate-y-1/2
                    `,
                    active === true &&
                        tw`
                            visible
                        `,
                ]}
            />
            {children}
        </button>
    )
}

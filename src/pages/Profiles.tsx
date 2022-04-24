import React, { ReactNode, useEffect, useRef, useState } from 'react'
import tw, { css } from 'twin.macro'
import List from '../components/List'

const items: [number, string][] = [
  [0, '7g basket'],
  [1, 'Advanced spring lever'],
  [2, 'Best overall pressure'],
  [3, 'Blooming espresso'],
  [4, 'Classic Italian espresso'],
  [5, 'Cremina lever machine'],
  [6, "Damian's LRV2"],
  [7, 'DefaultE61 espresso machine'],
  [8, 'Gentle & sweet'],
]

export default function Profiles() {
  const [profileId, setProfileId] = useState<number>()

  return (
    <List>
      {items.map(([id, label]) => (
        <Item key={id} id={id} onClick={setProfileId} active={profileId === id}>
          {label}
        </Item>
      ))}
    </List>
  )
}

type ItemProps = {
  children?: ReactNode
  id: number
  onClick?: (arg0: number) => void
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

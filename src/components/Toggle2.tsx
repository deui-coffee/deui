import React, { ReactNode, useEffect, useState, useRef } from 'react'
import tw, { css } from 'twin.macro'
import StatusIndicator, { Status } from './StatusIndicator'

type Props = {
  options: [[string, string], [string, string]]
  value: string
  onChange?: (arg0: string) => void
  status?: Status | ((arg0: string) => void)
}

export default function Toggle({
  options,
  value: valueProp,
  onChange,
  status: statusProp = Status.None,
}: Props) {
  const [value, setValue] = useState<string>(valueProp)

  const status =
    typeof statusProp === 'function' ? statusProp(value) : statusProp

  useEffect(() => {
    setValue(valueProp)
  }, [valueProp])

  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const commitTimeoutRef = useRef<number | undefined>()

  useEffect(
    () => () => {
      clearTimeout(commitTimeoutRef.current)
      commitTimeoutRef.current = undefined
    },
    []
  )

  function onItemClick(newValue: string) {
    setValue(newValue)

    clearTimeout(commitTimeoutRef.current)

    commitTimeoutRef.current = setTimeout(() => {
      if (typeof onChangeRef.current === 'function') {
        onChangeRef.current(newValue)
      }
    }, 500)
  }

  const isOn = options.findIndex(([w]) => w === value) === 1

  return (
    <div
      css={[
        tw`
          h-full
          relative
        `,
      ]}
    >
      <div tw="h-full w-full absolute p-2 pointer-events-none z-10">
        <div
          tw="h-full w-1/2 p-1 transition-transform duration-200 ease-linear relative"
          css={[isOn === true && tw`translate-x-full`]}
        >
          <StatusIndicator tw="absolute right-3 top-3" value={status} />
          <div tw="bg-off-white dark:bg-darkish-grey rounded-md h-full flex items-center justify-center">
            &zwnj;
            {options.map(([v, label]) => (
              <span
                key={`${v}`}
                tw="absolute"
                css={[
                  tw`transition-opacity duration-200`,
                  value !== v && tw`opacity-0`,
                ]}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div tw="flex h-full p-2">
        {options.map(([v, label]) => (
          <Item
            key={`${v}`}
            value={v}
            onClick={onItemClick}
            active={value === v}
          >
            {label}
          </Item>
        ))}
      </div>
    </div>
  )
}

type ItemProps = {
  children: ReactNode
  value: string
  onClick?: (arg0: string) => void
  active?: boolean
}

function Item({ value, children, onClick, active = false }: ItemProps) {
  return (
    <button
      css={[
        css`
          -webkit-tap-highlight-color: transparent;
        `,
        tw`
          appearance-none
          flex-zz-half
          h-full
          outline-none
          p-1
        `,
      ]}
      type="button"
      onClick={() => {
        if (typeof onClick === 'function') {
          onClick(value)
        }
      }}
    >
      <div
        tw="rounded-md h-full flex items-center justify-center transition-opacity duration-200 ease-linear"
        css={[
          active === true && tw`opacity-0`,
          active === false && tw`delay-100`,
        ]}
      >
        {children}
      </div>
    </button>
  )
}

import React, { ReactNode, useEffect, useState, useRef } from 'react'
import tw from 'twin.macro'

type Props = {
  options: [[string, string], [string, string]]
  value: string
  onChange?: (arg0: string) => void
}

export default function Toggle({ options, value: valueProp, onChange }: Props) {
  const [value, setValue] = useState<string>(valueProp)

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
    <div tw="h-full relative">
      <div tw="h-full w-full absolute p-2 pointer-events-none z-10">
        <div
          tw="h-full w-1/2 p-1 transition-transform duration-200 ease-linear"
          css={[isOn === true && tw`translate-x-full`]}
        >
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
      tw="appearance-none flex-zz-half p-1 h-full outline-none"
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

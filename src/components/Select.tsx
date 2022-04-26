import React, { useEffect, useState } from 'react'
import tw from 'twin.macro'
import { css } from '@emotion/react'
import StatusIndicator, { Status } from './StatusIndicator'

type Props = {
  onChange?: (arg0: string | undefined) => void
  options?: [string, string][]
  placeholder?: string
  status?: Status
  value?: string | undefined
}

export default function Select({
  onChange,
  options = [],
  placeholder = 'Select',
  status: statusProp = Status.None,
  value: valueProp,
}: Props) {
  const [value, setValue] = useState<string | undefined>()

  useEffect(() => {
    setValue(valueProp)
  }, [valueProp])

  const [selectedValue, selectedLabel] =
    options.find(([v]) => v === value) || []

  function onClick() {
    const [[v]] = options

    const newValue = typeof value === 'undefined' ? v : undefined

    setValue(newValue)

    if (typeof onChange === 'function') {
      onChange(newValue)
    }

    // @TODO Drawer
  }

  const status = typeof selectedValue === 'undefined' ? Status.None : statusProp

  return (
    <div
      css={[
        tw`
          relative
          h-full
          w-full
        `,
      ]}
    >
      <StatusIndicator
        css={[
          tw`
            absolute
            pointer-events-none
            right-2
            top-2
          `,
        ]}
        value={status}
      />
      <button
        css={[
          css`
            -webkit-tap-highlight-color: transparent;
          `,
          tw`
            appearance-none
            flex
            h-full
            items-center
            justify-center
            text-t0
            w-full
          `,
          typeof selectedLabel === 'undefined' && tw`text-medium-grey`,
        ]}
        type="button"
        onClick={onClick}
      >
        {selectedLabel || placeholder}
      </button>
    </div>
  )
}

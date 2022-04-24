import React from 'react'
import tw, { css } from 'twin.macro'
import Metric from '../components/Metric'

export default function Metrics() {
  return (
    <>
      <header>
        <h1
          css={[
            tw`
              dark:text-lighter-grey
              font-medium
              text-t2
            `,
          ]}
        >
          Expresso
        </h1>
        <p
          css={[
            tw`
              font-medium
              dark:text-medium-grey
              text-t0
              mt-1
            `,
          ]}
        >
          Warming up
        </p>
      </header>
      <button
        type="button"
        css={[
          css`
            -webkit-tap-highlight-color: transparent;
          `,
          tw`
            appearance-none
            border-b
            border-heavy-grey
            border-t
            flex
            font-medium
            h-[88px]
            items-center
            justify-between
            text-left
            text-t1
            w-full
            my-8
          `,
        ]}
      >
        <div>Best overall pressure</div>
        <div>
          <svg
            width="11"
            height="19"
            viewBox="0 0 11 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M1.006 1.353a1.5 1.5 0 0 1 2.122 0l7.07 7.07a1.5 1.5 0 0 1 0 2.122l-7.066 7.067a1.5 1.5 0 0 1-2.122-2.121l6.007-6.007-6.01-6.01a1.5 1.5 0 0 1 0-2.121z"
              fill="currentColor"
            />
          </svg>
        </div>
      </button>
      <Metric label="Metal Temp" value={56} unit="°C" />
      <Metric label="Pressure" value={0.0} unit="bar" />
      <Metric label="Flow Rate" value={0.0} unit="ml/s" />
      <Metric label="Shot Time" value={0.0} unit="s" />
      <Metric label="Weight" value={0.0} unit="g" />
    </>
  )
}

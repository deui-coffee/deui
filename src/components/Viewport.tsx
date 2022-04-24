import React, { Children, ReactElement, useReducer } from 'react'
import tw, { css } from 'twin.macro'
import { Props as PageProps } from './Page'
import { useSwipeable } from 'react-swipeable'
import { View } from '../types'

type PageChild = ReactElement & {
  props: PageProps
}

type Props = {
  children: PageChild | PageChild[]
  initialView?: View
}

type ViewportState = {
  count: number
  index: number
  view: undefined | View
  views: View[]
}

enum ActionType {
  Init,
  Next,
  Prev,
  Exact,
}

type Action = [ActionType.Next] | [ActionType.Prev] | [ActionType.Exact, View]

function init(view: View | undefined) {
  return (children: Props['children']): ViewportState => {
    const views = React.Children.toArray(children).map((child: unknown) => {
      return (child as PageChild).props.view
    })

    return {
      count: views.length,
      index: views.indexOf(view) || 0,
      view: view || views[0],
      views,
    }
  }
}

function reducer(state: ViewportState, [type, payload]: Action): ViewportState {
  const { views, count, index } = state

  switch (type) {
    case ActionType.Prev:
      return reducer(state, [ActionType.Exact, views[Math.max(0, index - 1)]])
    case ActionType.Next:
      return reducer(state, [
        ActionType.Exact,
        views[Math.min(count - 1, index + 1)],
      ])
    case ActionType.Exact:
      return {
        ...state,
        index: state.views.indexOf(payload),
        view: payload,
      }
    default:
  }

  return state
}

export default function Viewport({ children, initialView }: Props) {
  const [{ count, index, views, view }, dispatch] = useReducer(
    reducer,
    children,
    init(initialView)
  )

  const handlers = useSwipeable({
    preventDefaultTouchmoveEvent: true,
    onSwipedLeft() {
      dispatch([ActionType.Next])
    },
    onSwipedRight() {
      dispatch([ActionType.Prev])
    },
  })

  return (
    <>
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
          {Children.map(children, (child) => (
            <div
              style={{
                flex: `0 0 ${100 / count}%`,
              }}
            >
              {child}
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
        {views.map((v) => (
          <li key={v}>
            <button
              type="button"
              css={[
                css`
                  -webkit-tap-highlight-color: transparent;
                `,
                tw`
                  [> svg]:block
                  appearance-none
                  bg-white
                  dark:bg-black
                  dark:opacity-50
                  dark:text-medium-grey
                  flex
                  h-12
                  items-center
                  justify-center
                  opacity-25
                  rounded-full
                  text-darker-grey
                  w-12
                `,
                view === v &&
                  tw`
                    dark:text-lighter-grey
                    !opacity-100
                  `,
              ]}
              onClick={() => void dispatch([ActionType.Exact, v])}
            >
              <Icon view={v} />
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

type IconProps = {
  view: View
}

function Icon({ view }: IconProps) {
  switch (view) {
    case View.Settings:
      return (
        <svg
          width="16"
          height="14"
          viewBox="0 0 16 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.5 1.75a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-3 1.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm-3 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-3 1.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M.5 3.25a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1-.75-.75zm0 7.5a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75zm8 0a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1-.75-.75z"
            fill="currentColor"
          />
        </svg>
      )
    case View.Metrics:
      return (
        <svg
          width="18"
          height="22"
          viewBox="0 0 18 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.807.47a.75.75 0 0 1 0 1.06c-.53.53-.538.833-.51 1 .043.264.229.54.577 1l.045.06c.29.383.705.93.823 1.58.142.789-.16 1.547-.9 2.286a.75.75 0 1 1-1.06-1.062c.512-.511.512-.8.483-.957-.047-.263-.237-.537-.588-1.002l-.034-.045c-.294-.388-.716-.946-.827-1.616-.13-.793.182-1.556.93-2.304a.75.75 0 0 1 1.061 0zm-4.23 2.56a.75.75 0 0 1 0 1.06.863.863 0 0 0-.197.26c-.011.027-.01.035-.009.038v.001c.01.06.06.154.271.433l.032.042c.161.211.444.583.527 1.033.106.587-.131 1.123-.604 1.596a.75.75 0 0 1-1.06-1.06c.129-.13.17-.21.183-.242.007-.019.006-.022.005-.024-.011-.062-.064-.155-.28-.44l-.026-.035c-.163-.215-.451-.594-.528-1.06-.096-.59.149-1.126.625-1.602a.75.75 0 0 1 1.061 0zM.25 10.973a.75.75 0 0 1 .75-.75h12.032a.75.75 0 0 1 .75.75v.253h.253a3.758 3.758 0 1 1 0 7.516h-1.062c-.117.201-.25.403-.4.6-1.004 1.32-2.735 2.408-5.557 2.408-1.753 0-3.43-.473-4.686-1.443-1.277-.985-2.08-2.455-2.08-4.32v-5.014zm11.617 6.65a4.405 4.405 0 0 1-.488.811c-.703.924-1.98 1.816-4.363 1.816-1.501 0-2.833-.407-3.77-1.13-.918-.708-1.496-1.744-1.496-3.133v-4.264h10.532v4.264c0 .287-.088.934-.415 1.636zm1.729-.381h.439a2.258 2.258 0 1 0 0-4.516h-.253v3.26c0 .294-.047.739-.186 1.256z"
            fill="currentColor"
          />
        </svg>
      )
    case View.Profiles:
      return (
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.625 9.76a.75.75 0 0 1 .75-.75H9.75a.75.75 0 0 1 0 1.5H5.375a.75.75 0 0 1-.75-.75zm0 3.124a.75.75 0 0 1 .75-.75h2.5a.75.75 0 1 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75zm0 3.126a.75.75 0 0 1 .75-.75h2.5a.75.75 0 1 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.125 2.384A2.375 2.375 0 0 0 6.75 4.76a.75.75 0 0 1-.75.75H2.875a.5.5 0 0 0-.5.5v13.125a.5.5 0 0 0 .5.5h6.25a.75.75 0 1 1 0 1.5h-6.25a2 2 0 0 1-2-2V6.01a2 2 0 0 1 2-2h2.448a3.875 3.875 0 0 1 7.604 0h2.448a2 2 0 0 1 2 2v1.875a.75.75 0 0 1-1.5 0V6.01a.5.5 0 0 0-.5-.5H12.25a.75.75 0 0 1-.75-.75 2.375 2.375 0 0 0-2.375-2.375z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.125 3.384a1.063 1.063 0 1 0 0 2.125 1.063 1.063 0 0 0 0-2.125zm6.25 7.75a4.25 4.25 0 1 0 0 8.5 4.25 4.25 0 0 0 0-8.5zm-5.75 4.25a5.75 5.75 0 1 1 11.5 0 5.75 5.75 0 0 1-11.5 0z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M18.053 13.33a.75.75 0 0 1 .15 1.05l-2.42 3.228a1.379 1.379 0 0 1-1.582.463 1.374 1.374 0 0 1-.491-.315l-1.25-1.25a.75.75 0 1 1 1.06-1.061l1.149 1.148 2.334-3.113a.75.75 0 0 1 1.05-.15z"
            fill="currentColor"
          />
        </svg>
      )
    default:
  }

  throw new Error('Invalid view')
}

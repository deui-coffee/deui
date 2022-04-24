import React, { Children, ReactElement, useReducer } from 'react'
import tw from 'twin.macro'
import { Props as PageProps } from './Page'
import { useSwipeable } from 'react-swipeable'
import { View } from '../types'

type PageChild = ReactElement & {
  props: PageProps
}

type Props = {
  children: PageChild | PageChild[]
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

type Action =
  | [ActionType.Init, Props['children']]
  | [ActionType.Next]
  | [ActionType.Prev]
  | [ActionType.Exact, View]

function init(children: Props['children']): ViewportState {
  const views = React.Children.toArray(children).map((child: unknown) => {
    return (child as PageChild).props.view
  })

  return {
    count: views.length,
    index: Math.min(1, views.length) - 1,
    view: views[0],
    views,
  }
}

function reducer(state: ViewportState, [type, payload]: Action): ViewportState {
  const { views, count, index } = state

  switch (type) {
    case ActionType.Init:
      return init(payload)
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

export default function Viewport({ children }: Props) {
  const [{ count, index }, dispatch] = useReducer(reducer, children, init)

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
    <div
      {...handlers}
      css={[
        tw`
          bg-off-white
          dark:(bg-dark-grey text-lighter-grey)
          overflow-hidden
          relative
          shadow-tmp
          text-darker-grey
          w-screen
        `,
      ]}
    >
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
  )
}

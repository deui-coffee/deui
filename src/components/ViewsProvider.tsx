import React, { ReactNode, useReducer, useCallback } from 'react'
import ViewStateContext, { ViewState } from '../contexts/ViewStateContext'
import ViewSetterContext, { Setter } from '../contexts/ViewSetterContext'
import { View } from '../types'

type Props = {
    children?: ReactNode
    items?: View[]
    initialView?: View
}

function reducer(state: ViewState, action: Action): ViewState {
    const { views, index, count } = state

    switch (action.type) {
        case ActionType.Prev:
            return reducer(state, {
                type: ActionType.Exact,
                payload: views[Math.max(0, index - 1)],
            })
        case ActionType.Next:
            return reducer(state, {
                type: ActionType.Exact,
                payload: views[Math.min(count - 1, index + 1)],
            })
        case ActionType.Exact:
            return {
                ...state,
                index: views.findIndex((v) => v === action.payload),
                view: action.payload,
            }
        default:
    }

    return state
}

const defaultItems = [View.Settings, View.Metrics, View.Profiles]

export default function ViewsProvider({
    items = defaultItems,
    initialView = defaultItems[0],
    children,
}: Props) {
    const [state, dispatch] = useReducer(reducer, {
        count: items.length,
        index: items.findIndex((v) => v === initialView),
        view: initialView,
        views: items,
    })

    const mod = useCallback<Setter>((instruction) => {
        switch (instruction) {
            case 'prev':
                dispatch({
                    type: ActionType.Prev,
                })
                return
            case 'next':
                dispatch({
                    type: ActionType.Next,
                })
                return
            default:
        }

        dispatch({
            type: ActionType.Exact,
            payload: instruction,
        })
    }, [])

    return (
        <ViewSetterContext.Provider value={mod}>
            <ViewStateContext.Provider value={state}>{children}</ViewStateContext.Provider>
        </ViewSetterContext.Provider>
    )
}

enum ActionType {
    Next,
    Prev,
    Exact,
}

type A<T, Q> = {
    type: T
    payload: Q
}

type Action =
    | Omit<A<ActionType.Next, void>, 'payload'>
    | Omit<A<ActionType.Prev, void>, 'payload'>
    | A<ActionType.Exact, View>

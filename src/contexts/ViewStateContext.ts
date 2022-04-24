import { createContext, useContext } from 'react'
import { View } from '../types'

export type ViewState = {
  count: number
  index: number
  view?: View
  views: View[]
}

const defaultState = {
  count: 0,
  index: -1,
  view: undefined,
  views: [],
}

const ViewStateContext = createContext<ViewState>(defaultState)

export function useViewState() {
  return useContext(ViewStateContext)
}

export default ViewStateContext

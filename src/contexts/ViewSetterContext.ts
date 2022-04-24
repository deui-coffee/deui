import { createContext, useContext } from 'react'
import { View } from '../types'

export type Setter = (instruction: View | 'next' | 'prev') => void

const ViewSetterContext = createContext<Setter>(() => {
  // Noop.
})

export function useViewSetter() {
  return useContext(ViewSetterContext)
}

export default ViewSetterContext

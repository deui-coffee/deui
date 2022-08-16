import { selectConnectedMachine } from '$/features/machine/selectors'
import { useSelector } from 'react-redux'

export default function useConnectedMachine() {
    return useSelector(selectConnectedMachine)
}

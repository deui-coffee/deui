import { RefObject, useEffect, useRef } from 'react'

export default function useOnMouseDownOutside(refs: RefObject<HTMLElement>[], fn: () => void) {
    const refsRef = useRef(refs)

    useEffect(() => {
        refsRef.current = refs
    }, [refs])

    const fnRef = useRef(fn)

    useEffect(() => {
        fnRef.current = fn
    }, [fn])

    useEffect(() => {
        function onMouseDown(e: MouseEvent) {
            let insideAny = false

            for (let i = 0; i < refsRef.current.length; i++) {
                const { current: root } = refsRef.current[i]

                if (root && root.contains(e.target as Element)) {
                    insideAny = true
                    break
                }
            }

            if (!insideAny) {
                fnRef.current()
            }
        }

        document.addEventListener('mousedown', onMouseDown)

        return () => {
            document.removeEventListener('mousedown', onMouseDown)
        }
    }, [])
}

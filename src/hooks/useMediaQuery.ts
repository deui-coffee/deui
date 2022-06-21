import { useEffect, useState } from 'react'

function matchMediaQuery(query: string): boolean {
    return typeof window !== 'undefined' && window.matchMedia(query).matches
}

export default function useMediaQuery(query: string): boolean {
    const [match, setMatch] = useState<boolean>(matchMediaQuery(query))

    useEffect(() => {
        const matcher = window.matchMedia(query)

        function onChange({ matches }: MediaQueryListEvent) {
            setMatch(matches)
        }

        matcher.addEventListener('change', onChange)

        return () => {
            matcher.removeEventListener('change', onChange)
        }
    }, [query])

    return match
}

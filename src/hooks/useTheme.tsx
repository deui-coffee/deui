import useLocalStorage from '@rehooks/local-storage'

export const useTheme = () => {
  const themeState = useLocalStorage<'dark' | 'light'>('theme', 'dark')

  return themeState
}

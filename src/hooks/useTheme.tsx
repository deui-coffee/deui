import useLocalStorage from '@rehooks/local-storage'

export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

export const Themes = [
  [Theme.Dark, 'Dark'],
  [Theme.Light, 'Light'],
]

export const useTheme = () => {
  const themeState = useLocalStorage<Theme>('theme', Theme.Dark)

  return themeState
}

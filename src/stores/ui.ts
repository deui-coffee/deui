import MetricsView from '$/components/NarrowView/MetricsView'
import ProfilesView from '$/components/NarrowView/ProfilesView'
import SettingsView from '$/components/NarrowView/SettingsView'
import MetricsIcon from '$/icons/MetricsIcon'
import ProfilesIcon from '$/icons/ProfilesIcon'
import SettingsIcon from '$/icons/SettingsIcon'
import { StorageKey, Theme, ViewId } from '$/types'
import { produce } from 'immer'
import { create } from 'zustand'

export const viewLineup = [
    {
        id: ViewId.Settings,
        component: SettingsView,
        icon: SettingsIcon,
    },
    {
        id: ViewId.Metrics,
        component: MetricsView,
        icon: MetricsIcon,
    },
    {
        id: ViewId.Profiles,
        component: ProfilesView,
        icon: ProfilesIcon,
    },
]

interface UiStore {
    isEditingBackendUrl: boolean

    setIsEditingBackendUrl: (value: boolean) => void

    theme: Theme

    setTheme: (theme: Theme) => void

    viewId: ViewId

    viewIndex: number

    setView: (instruction: 'next' | 'prev' | ViewId) => void
}

export const useUiStore = create<UiStore>((set, get) => {
    function setState(fn: (next: UiStore) => void) {
        set((current) => produce(current, fn))
    }

    return {
        isEditingBackendUrl: false,

        setIsEditingBackendUrl(value) {
            setState((next) => {
                next.isEditingBackendUrl = value
            })
        },

        theme: localStorage.getItem(StorageKey.Theme) === Theme.Dark ? Theme.Dark : Theme.Light,

        setTheme(theme) {
            localStorage.setItem(StorageKey.Theme, theme)

            setState((next) => {
                next.theme = theme
            })
        },

        viewIndex: 0,

        viewId: ViewId.Settings,

        setView(instruction) {
            setState((next) => {
                const { viewIndex } = next

                if (instruction === 'next' && viewIndex === viewLineup.length - 1) {
                    return
                }

                if (instruction === 'prev' && viewIndex === 0) {
                    return
                }

                const newIndex: number = (() => {
                    if (instruction === 'next') {
                        return viewIndex + 1
                    }

                    if (instruction === 'prev') {
                        return viewIndex - 1
                    }

                    return viewLineup.findIndex(({ id }) => id === instruction)
                })()

                next.viewIndex = newIndex

                next.viewId = viewLineup[newIndex].id
            })
        },
    }
})
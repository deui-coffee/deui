import MetricsView from '$/components/NarrowView/MetricsView'
import ProfilesView from '$/components/NarrowView/ProfilesView'
import SettingsView from '$/components/NarrowView/SettingsView'
import { MetricsIcon } from '$/icons'
import { ProfilesIcon } from '$/icons'
import { SettingsIcon } from '$/icons'
import { MachineMode, StorageKey, Theme, ViewId } from '$/types'
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

export const machineModeLineup = [
    MachineMode.Espresso,
    MachineMode.Steam,
    MachineMode.Flush,
    MachineMode.Water,
    MachineMode.Server,
]

interface UiStore {
    theme: Theme

    setTheme: (theme: Theme) => void

    viewId: ViewId

    viewIndex: number

    setView: (instruction: 'next' | 'prev' | ViewId) => void

    machineMode: MachineMode

    setMachineMode: (machineMode: MachineMode) => void
}

const initialTheme =
    localStorage.getItem(StorageKey.Theme) === Theme.Dark ? Theme.Dark : Theme.Light

export const useUiStore = create<UiStore>((set) => {
    function setState(fn: (next: UiStore) => void) {
        set((current) => produce(current, fn))
    }

    return {
        theme: initialTheme,

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

                const newView = viewLineup[newIndex]

                if (newView) {
                    next.viewIndex = newIndex

                    next.viewId = newView.id

                    return
                }

                console.warn('New view does not exist. Ignoring the switch.')
            })
        },

        machineMode: MachineMode.Server,

        setMachineMode(machineMode) {
            setState((next) => {
                next.machineMode = machineMode
            })
        },
    }
})

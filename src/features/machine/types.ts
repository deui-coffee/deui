export enum Awake {
    Unknown = 'unknown',
    No = 'no',
    Yes = 'yes',
}

export interface Profile {
    id: ProfileId
    label: string
}

export type ProfileId = string

export interface MachineState {
    awake: Awake
    scales: Scale[]
    selectedScaleId: undefined | ScaleId
    profiles: Profile[]
    selectedProfileId: ProfileId
}

export type ScaleId = string

export interface Scale {
    id: ScaleId
    label: string
}

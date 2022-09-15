export enum Power {
    On = 'on',
    Off = 'off',
    Unknown = 'unknown',
}

export enum ModeId {
    Espresso,
    Flush,
    Water,
    Steam,
}

export interface Profile {
    id: ProfileId
    label: string
}

export type ProfileId = string

export interface Machine {
    MAC: string
    name: string
}

export interface MachineState {
    power: Power
    scales: Scale[]
    selectedScaleId: undefined | ScaleId
    profiles: Profile[]
    selectedProfileId: ProfileId
    modeId: ModeId
    connectedMachine: undefined | Machine
}

export type ScaleId = string

export interface Scale {
    id: ScaleId
    label: string
}

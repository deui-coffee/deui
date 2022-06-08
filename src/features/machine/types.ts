export enum Awake {
    Unknown = 'unknown',
    No = 'no',
    Yes = 'yes',
}

export interface MachineState {
    awake: Awake
}

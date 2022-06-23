export interface MiscState {
    flags: {
        [key: string]: true
    }
    ui: {
        dark?: true
    }
}

export enum Flag {
    IsProfilesDrawerOpen = 'profile drawer',
}

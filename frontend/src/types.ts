export type Config = {
    start: [number, number],
    stop: [number, number],
    height: number,
    width: number,
    default_weight: number
}

export enum Action {
    Wall,
    Weight,
    Clear,
}

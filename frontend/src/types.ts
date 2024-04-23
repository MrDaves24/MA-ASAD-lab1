export type Config = {
    start: Position,
    stop: Position,
    height: number,
    width: number,
    default_weight: number
}

export enum Action {
    Wall,
    Weight,
    Clear,
}

export type Weight = number | 'w'

export class Position {
    constructor(private readonly _x: number, private readonly _y: number) {}

    public equals(other: Position) : boolean {
        return this._x === other._x && this._y === other._y
    }
    public inside(config: Config) : boolean {
        return this._x >= 0 && this._x < config.width && this._y >= 0 && this._y < config.height
    }
    toString() : string {
        return `${this._x}-${this._y}`
    }
    public static fromString(str: string) : Position {
        const [x, y] = str.split('-').map(Number)
        return new Position(x, y)
    }
    public get x() : number {
        return this._x
    }
    public get y() : number {
        return this._y
    }

    public toJSON() : string {
        return this.toString()
    }
}

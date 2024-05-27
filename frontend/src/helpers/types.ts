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
    public directionTo(other: Position) : "←"|"↑"|"↓"|"→"|"↖"|"↗"|"↘"|"↙" {
        if (this._x === other._x) {
            if (this._y === other._y) {
                throw new Error('Positions are the same')
            }
            return this._y < other._y ? '↓' : '↑'
        }
        if (this._y === other._y) {
            return this._x < other._x ? '→' : '←'
        }
        if (this._x < other._x) {
            return this._y < other._y ? '↘' : '↗'
        }
        return this._y < other._y ? '↙' : '↖'
    }

    public toJSON() : string {
        return this.toString()
    }
}

export type ApiRequest = {
    weights: Map<string, Weight>;
    config: Config;
    heuristic: string;
    resolve: (value: Map<string, string> | undefined) => void;
    reject: (reason?: any) => void;
    retries: number;
};
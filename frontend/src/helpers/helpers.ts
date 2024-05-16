import { API } from './const'
import { type Config, Position, Weight } from './types'

import { fetcher as fett } from 'itty-fetcher'

const fetcher = fett({ base: API })

export async function callapi(weights: Map<string, Weight>, config: Config, heuristic: string): Promise<Map<string, "←" | "↑" | "↓" | "→" | "↖" | "↗" | "↘" | "↙"> | undefined> {
    const w: string[] | { error: string } = await fetcher.post('/a_star', { config, weights: [...weights.entries()], heuristic })

    // @ts-expect-error : TS doesn't understand that w is a string[] or {error: string}
    if (w.error !== undefined) {
        // @ts-expect-error : again
        console.warn(w.error)
        return undefined
    }
    // @ts-expect-error : again
    const path: Position[] = w.map(Position.fromString)

    const res = new Map()
    for (let i = 1; i < path.length - 1; i++) {
        res.set(path[i].toString(), path[i].directionTo(path[i + 1]))
    }

    return res
}

export function range(from: number, to?: number): Array<number> {
    if (to === undefined) {
        to = from
        from = 0
    }
    return Array.from({ length: to - from }, (_, i) => i + from)
}

export function can_reduce(config: { start: Position, stop: Position }, new_height: number, new_width: number): boolean {
    if (new_height === 0 || new_width === 0) return false

    // Don't let start and stop collide
    if (config.start.x === new_width && config.stop.x === config.start.x - 1 && config.start.y === config.stop.y) return false
    if (config.start.y === new_height && config.stop.y === config.start.y - 1 && config.start.x === config.stop.x) return false
    if (config.stop.x === new_width && config.start.x === config.stop.x - 1 && config.start.y === config.stop.y) return false
    if (config.stop.y === new_height && config.start.y === config.stop.y - 1 && config.start.x === config.stop.x) return false

    return true
}

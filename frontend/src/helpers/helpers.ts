import { type Position } from './types'

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

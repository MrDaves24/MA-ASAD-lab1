import {type Config} from './types'

export async function callapi(weights: Map<string, number | 'w'>, config: Config) : Promise<Map<string, string>> {
    // ←↑↓→↖↗↘↙
    throw "todo"
}

export function range(from: number, to?: number) : Array<number> {
    if (to === undefined) {
        to = from
        from = 0
    }
    return Array.from({length: to - from}, (_, i) => i + from)
}

import {COLOR_GRADIENT_FROM, COLOR_GRADIENT_TO} from '../helpers/const'

export function color(ratio: number): string {
    if (isNaN(ratio)) ratio = 0.1

    const from = COLOR_GRADIENT_FROM
    const to = COLOR_GRADIENT_TO

    const r = Math.round(from[0] + (to[0] - from[0]) * ratio)
    const g = Math.round(from[1] + (to[1] - from[1]) * ratio)
    const b = Math.round(from[2] + (to[2] - from[2]) * ratio)

    return `rgba(${r}, ${g}, ${b}, ${Math.max(0.1, ratio)})`
}

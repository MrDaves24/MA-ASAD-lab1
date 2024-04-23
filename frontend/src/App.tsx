import './App.css'

import {callapi, range} from './helpers'
import {Action, Config} from './types'

import {useEffect, useState} from 'react'
import {DndContext, DragEndEvent, useDraggable, useDroppable} from '@dnd-kit/core'

function Draggable(props: {id: string, className?: string, children: string}) {
    const {attributes, listeners, setNodeRef, transform} = useDraggable({
        id: props.id,
    });
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;


    return (
        <td ref={setNodeRef} style={style} className={(props.className ?? "") + " draggable"} {...listeners} {...attributes}>
            {props.children}
        </td>
    );
}

function Droppable(props: {id: string, className?: string, children?: string, data: [number, number], style?: {backgroundColor: string}, onClick?: () => void}) {
    const {setNodeRef} = useDroppable({
        id: props.id,
        data: props.data,
    });

    return (
        <td style={props.style} className={props.className} ref={setNodeRef} onClick={props.onClick}>
            {props.children}
        </td>
    );
}

export default function App() {
    const [config, setConfig] = useState<Config>({default_weight: 1, height: 10, start: [0, 0], stop: [9, 9], width: 10})
    const [weights, setWeights] = useState<Map<string, number | 'w'>>(new Map())
    const [grid, setGrid] = useState<Map<string, string>>(new Map())
    const [ts, setTs] = useState<number>(0)
    const [action, setAction] = useState<Action>(Action.Wall)

    useEffect(() => {
        callapi(weights, config).then(grid => setGrid(() => grid))
    }, [config, weights])

    // Dev fake config
    useEffect(() => {
        setGrid(() => {
            const res = new Map()

            res.set("1-1", "↘")
            res.set("2-2", "↘")

            return res
        })

        setWeights(() => {
            const res = new Map()

            res.set("0-1", "w")
            res.set("1-0", "w")
            res.set("0-2", 200)

            return res
        })
    }, [])

    const handle_default_weight = (default_weight: number) => {
        if (isNaN(default_weight)) return
        clearTimeout(ts)
        const new_ts = setTimeout(() => setConfig((prev) => ({...prev, default_weight})), 500)
        setTs(() => new_ts)
    }

    const handle_drop = (e: DragEndEvent) => {
        if (e.over === null) return

        const action = e.active.id as "start" | "stop"
        const pos = e.over.data.current as [number, number]

        if (config.stop[0] === pos[0] && config.stop[1] === pos[1]) return
        if (config.start[0] === pos[0] && config.start[1] === pos[1]) return


        setConfig(config => ({...config, [action]: pos}))
        setWeights(weights => {
            const res = new Map(weights)
            res.delete(`${pos[0]}-${pos[1]}`)
            return res
        })
    }

    const handle_click = (x: number, y: number) => {
        return () => {
            if (action === Action.Weight) {
                const weight = window.prompt("Enter weight", "1")
                if (weight === null) return
                const value = parseInt(weight)
                if (isNaN(value)) return
                if (value < 1) return
                setWeights(weights => {
                    const res = new Map(weights)
                    res.set(`${x}-${y}`, value)
                    return res
                })
            } else if (action === Action.Wall) {
                setWeights(weights => {
                    const res = new Map(weights)
                    res.set(`${x}-${y}`, 'w')
                    return res
                })
            } else if (action === Action.Clear) {
                setWeights(weights => {
                    const res = new Map(weights)
                    res.delete(`${x}-${y}`)
                    return res
                })
            } else {
                throw "wtf ?"
            }
        }
    }

    const {max, min} = Array.from(weights.values()).reduce((acc, val) => {
        if (val === 'w') return acc

        if (val > acc.max) acc.max = val
        if (val < acc.min) acc.min = val

        return acc
    }, {min: config.default_weight, max: config.default_weight})

    return (<div id="body">
        <h1>A*</h1>
        <label>Default weight : <input min={1} step={1} type="number" defaultValue={config.default_weight} onChange={e => handle_default_weight(e.target.valueAsNumber)} /></label>

        <br/>
        <br/>

        <div className="icons">
            <span id="icon-wall" className={action === Action.Wall ? 'active' : ''} onClick={() => setAction(() => Action.Wall)}>⧚⧚</span>
            <span id="icon-wall" className={action === Action.Weight ? 'active' : ''} onClick={() => setAction(() => Action.Weight)}>123</span>
            <span id="icon-clear" className={action === Action.Clear ? 'active' : ''} onClick={() => setAction(() => Action.Clear)}>❌</span>
        </div>

        <DndContext onDragEnd={handle_drop}>
            <table>
                <tbody>
                {range(config.height).map((y: number) => (<tr key={`line-${y}`}>
                    {range(config.width).map((x: number) => {
                        if (config.start[0] === x && config.start[1] === y) {
                            return (<Draggable key={`${x}-${y}`} className="start" id="start">⚑</Draggable>)
                        } else if (config.stop[0] === x && config.stop[1] === y) {
                            return (<Draggable key={`${x}-${y}`} className="stop" id="stop">⚑</Draggable>)
                        } else {
                            const key = `${x}-${y}`
                            let content: string | undefined;
                            const className: string[] = []
                            let weight: number;

                            const w = weights.get(key)

                            if (w === 'w') {
                                content = '⧚⧚'
                                className.push("wall")
                            } else if (grid.get(key) !== undefined) {
                                content = grid.get(key)
                            }

                            if (w === 'w' || w === undefined) {
                                weight = config.default_weight
                            } else {
                                weight = w
                            }

                            const ratio = (weight - min) / (max - min)

                            const style = {
                                backgroundColor: color(ratio),
                            }

                            return (<Droppable
                                onClick={handle_click(x, y)}
                                style={style}
                                data={[x, y]}
                                id={`cell-${key}`}
                                key={`cell-${key}`}
                                className={className.join(" ")}
                            >
                                {content}
                            </Droppable>)
                        }
                    })}
                </tr>))}
                </tbody>
            </table>
        </DndContext>
    </div>)
}

function color(ratio: number): string {
    const from = [33, 60, 255]
    const to = [255, 50, 0]

    const r = Math.round(from[0] + (to[0] - from[0]) * ratio)
    const g = Math.round(from[1] + (to[1] - from[1]) * ratio)
    const b = Math.round(from[2] + (to[2] - from[2]) * ratio)

    return `rgba(${r}, ${g}, ${b}, ${ratio})`
}

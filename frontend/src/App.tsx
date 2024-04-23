import './App.css'

import {callapi, range} from './helpers'
import {Action, Config, Position, Weight} from './types'

import {useEffect, useMemo, useState} from 'react'
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

function Droppable(props: {id: string, className?: string, children?: string, data: Position, style?: {backgroundColor: string}, onClick?: () => void}) {
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
    const [config, setConfig] = useState<Config>({default_weight: 1, height: 10, start: new Position(0, 0), stop: new Position(9,9 ), width: 10})
    const [weights, setWeights] = useState<Map<string, Weight>>(new Map())
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
        const pos = e.over.data.current as Position

        if (config.stop.equals(pos)) return
        if (config.start.equals(pos)) return

        setConfig(config => ({...config, [action]: pos}))
        setWeights(weights => {
            const res = new Map(weights)
            res.delete(pos.toString())
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
                throw "Shouldn't happen"
            }
        }
    }

    const add_column = () => {
        setConfig(config => ({...config, width: config.width + 1}))
    }
    const add_line = () => {
        setConfig(config => ({...config, height: config.height + 1}))
    }

    const can_reduce = (height: number, width: number) : boolean => {
        if (height === 0 || width === 0) return false

        // Don't let start and stop collide
        if (config.start.x === width && new Position(config.start.x - 1, config.start.y).equals(config.stop)) return false
        if (config.start.y === height && new Position(config.start.x, config.start.y - 1).equals(config.stop)) return false
        if (config.stop.x === width && new Position(config.stop.x - 1, config.stop.y).equals(config.start)) return false
        if (config.stop.y === height && new Position(config.stop.x, config.stop.y - 1).equals(config.start)) return false

        return true
    }

    const remove_column = () => {
        const new_width = config.width - 1
        return () => {
            setWeights(weights => {
                const res = new Map(weights)
                for (let y = 0; y < config.height; y++) {
                    res.delete(new Position(new_width, y).toString())
                }
                return res
            })
            setConfig(config => {
                config.width = new_width

                if (config.start.x == config.width) config.start = new Position(config.start.x - 1, config.start.y)
                if (config.stop.x == config.width) config.stop = new Position(config.stop.x - 1, config.stop.y)

                return {...config}
            })
        }
    }

    const remove_line = () => {
        const new_height = config.height - 1
        return () => {
            setWeights(weights => {
                const res = new Map(weights)
                for (let x = 0; x < config.width; x++) {
                    res.delete(new Position(x, new_height).toString())
                }
                return res
            })
            setConfig(config => {
                config.height = new_height

                if (config.start.y === config.height) config.start = new Position(config.start.x, config.start.y - 1)
                if (config.stop.y === config.height) config.stop = new Position(config.stop.x, config.stop.y - 1)

                return {...config}
            })
        }
    }

    const {max, min} = useMemo(() => {
        return Array.from(weights.values()).reduce((acc, val) => {
            if (val === 'w') return acc

            if (val > acc.max) acc.max = val
            if (val < acc.min) acc.min = val

            return acc
        }, {min: config.default_weight, max: config.default_weight})
    }, [config, weights])

    return (<div id="body">
        <h1>A*</h1>
        <label>Default weight : <input min={1} step={1} type="number" defaultValue={config.default_weight} onChange={e => handle_default_weight(e.target.valueAsNumber)} /></label>

        <br/>
        <br/>

        Line : <button onClick={add_line}>+</button>&nbsp;
        <button disabled={!can_reduce(config.height - 1, config.width)} onClick={remove_line()}>-</button><br/>
        Column : <button onClick={add_column}>+</button>&nbsp;
        <button disabled={!can_reduce(config.height, config.width - 1)} onClick={remove_column()}>-</button><br/>
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
                        const key = new Position(x, y).toString()
                        if (config.start.x === x && config.start.y === y) {
                            return (<Draggable key={key} className="start" id="start">⚑</Draggable>)
                        } else if (config.stop.x === x && config.stop.y === y) {
                            return (<Draggable key={key} className="stop" id="stop">⚑</Draggable>)
                        } else {
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

                            const ratio = (weight === min || max === min) ? 0 : (weight - min) / (max - min)

                            const style = {
                                backgroundColor: color(ratio),
                            }

                            return (<Droppable
                                onClick={handle_click(key)}
                                style={style}
                                data={new Position(x, y)}
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
    if (isNaN(ratio)) ratio = 0.1

    const from = [33, 60, 255]
    const to = [255, 50, 0]

    const r = Math.round(from[0] + (to[0] - from[0]) * ratio)
    const g = Math.round(from[1] + (to[1] - from[1]) * ratio)
    const b = Math.round(from[2] + (to[2] - from[2]) * ratio)

    return `rgba(${r}, ${g}, ${b}, ${Math.max(0.1, ratio)})`
}

import './style/App.css'

import { can_reduce, range } from './helpers/helpers'
import { Action, Config, Position, Weight } from './helpers/types'
import { queueApiCall } from './helpers/api'

import { Draggable, Droppable } from './kit/Dnd'
import { color } from './kit/Color'

import { useEffect, useMemo, useState } from 'react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'

export default function App() {
    const [config, setConfig] = useState<Config>({ default_weight: 1, height: 10, start: new Position(0, 0), stop: new Position(9, 9), width: 10 })
    const [weights, setWeights] = useState<Map<string, Weight>>(new Map())
    const [heuristic, setHeuristic] = useState<string>('euclidean')
    const [grid, setGrid] = useState<Map<string, string>>(new Map())
    const [ts, setTs] = useState<number>(0)
    const [action, setAction] = useState<Action>(Action.Wall)
    const [connectivityIssue, setConnectivityIssue] = useState<boolean>(false);

    useEffect(() => {
        queueApiCall(weights, config, heuristic, setConnectivityIssue).then(grid => {
            if (grid === undefined) setGrid(() => new Map());
            else setGrid(() => grid);
        });
    }, [config, weights, heuristic])

    const handle_default_weight = (default_weight: number) => {
        if (isNaN(default_weight)) return
        clearTimeout(ts)
        const new_ts = setTimeout(() => setConfig((prev) => ({ ...prev, default_weight })), 500)
        setTs(() => new_ts)
    }

    const handle_drop = (e: DragEndEvent) => {
        if (e.over === null) return

        const action = e.active.id as "start" | "stop"
        const pos = e.over.data.current as Position

        if (config.stop.equals(pos)) return
        if (config.start.equals(pos)) return

        setConfig(config => ({ ...config, [action]: pos }))
        setWeights(weights => {
            const res = new Map(weights)
            res.delete(pos.toString())
            return res
        })
    }

    const handle_click = (pos: string) => {
        return () => {
            let value: number | undefined;
            if (action === Action.Weight) {
                const weight = window.prompt("Enter weight", "1")
                if (weight === null) return
                value = parseInt(weight ?? "0")
                if (isNaN(value)) return
                if (value < 1) return
            }

            setWeights(weights => {
                const res = new Map(weights)

                if (action === Action.Weight) {
                    res.set(pos, value ?? 1)
                } else if (action === Action.Wall) {
                    res.set(pos, 'w')
                } else if (action === Action.Clear) {
                    res.delete(pos)
                } else {
                    return weights
                }

                return res
            })
        }
    }

    const add_column = () => {
        setConfig(config => ({ ...config, width: config.width + 1 }))
    }
    const add_line = () => {
        setConfig(config => ({ ...config, height: config.height + 1 }))
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

                return { ...config }
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

                return { ...config }
            })
        }
    }

    const { max, min } = useMemo(() => {
        return Array.from(weights.values()).reduce((acc, val) => {
            if (val === 'w') return acc

            if (val > acc.max) acc.max = val
            if (val < acc.min) acc.min = val

            return acc
        }, { min: config.default_weight, max: config.default_weight })
    }, [config.default_weight, weights])

    const heuristics = [
        { value: "euclidean", label: "Euclidean" },
        { value: "manhattan", label: "Manhattan" },
        { value: "chebyshev", label: "Chebyshev" },
    ];

    return (<div id="body">
        <h1>A*</h1>
        <label>Choose heuristic : <select
            defaultValue={config.default_weight}
            onChange={e => setHeuristic(e.target.value)}
        >
            {heuristics.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select></label>

        <br />
        <br />

        <label>Default weight : <input
            min={1}
            step={1}
            type="number"
            defaultValue={config.default_weight}
            onChange={e => handle_default_weight(e.target.valueAsNumber)}
        /></label>

        <br />
        <br />

        Line : <button onClick={add_line}>+</button>&nbsp;
        <button disabled={!can_reduce(config, config.height - 1, config.width)} onClick={remove_line()}>-</button><br />

        Column : <button onClick={add_column}>+</button>&nbsp;
        <button disabled={!can_reduce(config, config.height, config.width - 1)} onClick={remove_column()}>-</button><br />
        <br />

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
        {connectivityIssue && (
                <div className="connectivity-popup">
                    <p>There is a connectivity problem. Retrying...</p>
                </div>
            )}

    </div>)
}


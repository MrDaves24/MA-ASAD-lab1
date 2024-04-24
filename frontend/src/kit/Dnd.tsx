import {Position} from '../helpers/types'

import {useDraggable, useDroppable} from '@dnd-kit/core'
import React from 'react'

export function Draggable(props: { id: string, className?: string, children: string }) {
    const {attributes, listeners, setNodeRef, transform} = useDraggable({
        id: props.id,
    });
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;


    return (
        <td ref={setNodeRef} style={style}
            className={(props.className ?? "") + " draggable"} {...listeners} {...attributes}>
            {props.children}
        </td>
    );
}

export function Droppable(props: {
    id: string,
    className?: string,
    children?: string,
    data: Position,
    style?: React.CSSProperties,
    onClick?: () => void
}) {
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

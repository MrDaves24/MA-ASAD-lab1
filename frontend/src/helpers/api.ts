import { API, DEV } from './const'
import { fetcher as fett } from 'itty-fetcher'
import { type Config, Position, Weight, ApiRequest } from './types'

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const fetcher = fett(DEV ? { base: API } : {})
const apiQueue: ApiRequest[] = [];
let processingQueue = false;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const timeout = (ms: number) => new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timed out')), ms);
});


const processQueue = async (setConnectivityIssue: (value: boolean) => void) => {
    if (processingQueue) return;
    processingQueue = true;

    while (apiQueue.length > 0) {
        const { weights, config, heuristic, resolve, reject, retries } = apiQueue.shift()!;  
        try {
            const result = await callapi(weights, config, heuristic);
            resolve(result);
            setConnectivityIssue(false);
        } catch (error) {
            console.warn('API request failed, retrying...', error);
            if (retries < MAX_RETRIES) {
                await sleep(RETRY_DELAY);
                apiQueue.unshift({ weights, config, heuristic, resolve, reject, retries: retries + 1 });
                setConnectivityIssue(true);
            } else {
                apiQueue.unshift({ weights, config, heuristic, resolve, reject, retries: 0 }); // re-add to the beginning
                setConnectivityIssue(true);
                reject(error);
            }
        }
    }
    processingQueue = false;
};

export const queueApiCall = (weights: Map<string, Weight>, config: Config, heuristic: string, setConnectivityIssue: (value: boolean) => void): Promise<Map<string, string> | undefined> => {
    return new Promise((resolve, reject) => {
        apiQueue.push({ weights, config, heuristic, resolve, reject, retries: 0 });
        processQueue(setConnectivityIssue);
    });
};

async function callapi(weights: Map<string, Weight>, config: Config, heuristic: string): Promise<Map<string, "←" | "↑" | "↓" | "→" | "↖" | "↗" | "↘" | "↙"> | undefined> {
    const TIMEOUT_DURATION = 5000; // Timeout duration in milliseconds
    const fetchPromise = fetcher.post('/a_star', { config, weights: [...weights.entries()], heuristic });
    // @ts-expect-error : TS doesn't understand that w is a string[] or {error: string}
    const w: string[] | { error: string } = await Promise.race([fetchPromise, timeout(TIMEOUT_DURATION)]);
    // @ts-expect-error : TS doesn't understand that w is a string[] or {error: string}
    if (w.error !== undefined) {
        // @ts-expect-error : again
        throw new Error(w.error);      
    }

    // @ts-expect-error : again
    const path: Position[] = w.map(Position.fromString)
    const res = new Map()
    for (let i = 1; i < path.length - 1; i++) {
        res.set(path[i].toString(), path[i].directionTo(path[i + 1]))
    }
    return res
}
from heapq import heappush, heappop
from heuristics import *

def search(config, weights, start, stop, h_name):
    def inside(node):
        node = node.split('-')
        return 0 <= int(node[0]) < config["width"] and 0 <= int(node[1]) < config["height"]

    if not inside(start) or not inside(stop):
        print("start or stop is outside of grid :(")
        return None

    if stop in weights and weights[stop] == 'w':
        print("Stop is a wall...")
        return None

    frontier = []
    heappush(frontier, (0, start))
    came_from = {}
    cost_so_far = {}
    came_from[start] = 0
    cost_so_far[start] = 0

    def cost(node):
        return weights[node] if node in weights else config["default_weight"]

    def neighbors(node):
        node = node.split('-')
        x = int(node[0])
        y = int(node[1])

        candidates = [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]

        for candidate in candidates:
            if candidate[0] < 0 or candidate[1] < 0:
                continue
            candidate = f"{candidate[0]}-{candidate[1]}"
            if not inside(candidate):
                continue
            yield candidate

    while True:
        try:
            current_cost, current_node = heappop(frontier)
        except:
            print("AStar : out of node in heap")
            return None

        if current_node == stop:
            break

        # print(f"Neighbors: {neighbors(current_node)}")
        for next_node in neighbors(current_node):
            if cost(next_node) == 'w':
                continue
            new_cost = current_cost + cost(next_node)
            if next_node not in cost_so_far or new_cost < cost_so_far[next_node]:
                cost_so_far[next_node] = new_cost
                priority = new_cost + globals()[h_name](next_node, stop)
                heappush(frontier, (priority, next_node))
                came_from[next_node] = current_node

    path = []
    current_node = stop

    while current_node != start:
        path.append(current_node)
        current_node = came_from[current_node]

    path.append(start)
    path.reverse()

    return path


if __name__ == '__main__':
    config = {"width": 10, "height": 8, "default_weight": 1}
    weigths = {'0-1': 'w', '1-0': 'w', '0-2': 200}
    start = "0-0"
    stop = "9-7"

    print(search(config, weigths, start, stop, 'manhattan'))
    print(search(config, weigths, start, stop, 'euclidean'))
    print(search(config, weigths, start, stop, 'chebyshev'))

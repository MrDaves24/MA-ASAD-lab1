from heapq import heappush, heappop


def search(config, weights, start, stop):
    def inside(node):
        return 0 <= node[0] < config["width"] and 0 <= node[1] < config["height"]

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
        x, y = node
        return [(nx, ny) for nx, ny in
                [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1),
                 (x - 1, y - 1), (x + 1, y + 1), (x + 1, y - 1), (x - 1, y + 1)]
                if inside((nx, ny))]

    while True:
        try:
            current_cost, current_node = heappop(frontier)
            # print(f"Evaluate {current_node}")
        except:
            print("AStar : out of node in heap")
            return None

        if current_node == stop:
            # print("Reached end")
            break

        # print(f"Neighbors: {neighbors(current_node)}")
        for next_node in neighbors(current_node):
            if cost(next_node) == 'w':
                continue
            new_cost = current_cost + cost(next_node)
            if next_node not in cost_so_far or new_cost < cost_so_far[next_node]:
                cost_so_far[next_node] = new_cost
                heappush(frontier, (new_cost, next_node))
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
    weigths = {}
    start = (0, 0)
    stop = (9, 7)

    print(search(config, weigths, start, stop))

from heapq import heappush, heappop

class AStarGraph:
    def __init__(self, graph):
        self.graph = graph

    def heuristic(self, node, goal):
        # Ici, nous utilisons une simple heuristique de distance de Manhattan
        (x1, y1) = node
        (x2, y2) = goal
        return abs(x1 - x2) + abs(y1 - y2)

    def neighbors(self, node):
        x, y = node
        # Les voisins d'un nœud sont les nœuds adjacents dans le graphe
        return [(nx, ny) for nx, ny in [(x+1, y), (x-1, y), (x, y+1), (x, y-1)] if 0 <= nx < len(self.graph) and 0 <= ny < len(self.graph[0])]

    def cost(self, from_node, to_node):
        return self.graph[to_node[0]][to_node[1]]

    def a_star_search(self, start, goal):
        frontier = []
        heappush(frontier, (0, start))
        came_from = {}
        cost_so_far = {}
        came_from[start] = None
        cost_so_far[start] = 0

        while frontier:
            current_cost, current_node = heappop(frontier)

            if current_node == goal:
                break

            for next_node in self.neighbors(current_node):
                new_cost = cost_so_far[current_node] + self.cost(current_node, next_node)
                if next_node not in cost_so_far or new_cost < cost_so_far[next_node]:
                    cost_so_far[next_node] = new_cost
                    priority = new_cost + self.heuristic(next_node, goal)
                    heappush(frontier, (priority, next_node))
                    came_from[next_node] = current_node

        path = []
        current_node = goal
        while current_node != start:
            path.append(current_node)
            current_node = came_from[current_node]
        path.append(start)
        path.reverse()
        return path


if __name__ == "__main__":
    # Obtenez les arguments de la ligne de commande
    graph = eval(sys.argv[1])
    start = eval(sys.argv[2])
    goal = eval(sys.argv[3])

    # Création d'une instance de la classe AStarGraph
    astar = AStarGraph(graph)

    # Trouver le chemin le plus court
    shortest_path = astar.a_star_search(start, goal)
    # Pour l'instant vieux print dégeux à voir plus tard 
    print(shortest_path)

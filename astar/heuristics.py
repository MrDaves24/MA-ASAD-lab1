from math import sqrt

def manhattan(start: list, goal: list) -> int:
    start = list(map(int, start.split('-')))
    goal = list(map(int, goal.split('-')))
    return sum(abs(val1 - val2) for val1, val2 in zip(start, goal))

def euclidean(start: list, goal: list) -> int:
    start = list(map(int, start.split('-')))
    goal = list(map(int, goal.split('-')))
    return sqrt(sum((val1 - val2)**2 for val1, val2 in zip(start, goal))).__trunc__()

def chebyshev(start: list, goal: list) -> int:
    start = list(map(int, start.split('-')))
    goal = list(map(int, goal.split('-')))
    return max(abs(val1 - val2) for val1, val2 in zip(start, goal))
from flask import Flask, request, jsonify
from subprocess import Popen, PIPE

app = Flask(__name__)

# On peut faire pour plusieurs algo si on veut la découpe ce fait ici dans le server 
# Pour l'instant que A* et je sais pas si c'est super bien codé 

@app.route('/shortest_path', methods=['POST'])
def shortest_path():
    data = request.get_json()
    graph = data.get('graph')
    start = data.get('start')
    goal = data.get('goal')

    try:
        container = client.containers.run('astar_algorithm', command=f'python astar.py "{graph}" "{start}" "{goal}"', detach=True)
        container.wait()

        # Récupérer vieux print
        stdout = container.logs().decode().strip()

        return jsonify({'shortest_path': stdout}), 200

    except docker.errors.APIError as e:
        return jsonify({'error': 'An error occurred while running the algorithm.'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3939)

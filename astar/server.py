from flask import Flask, request, jsonify
from astar import search

app = Flask(__name__)
error = jsonify({'error': 'An error occurred while running the algorithm.'}), 500


@app.route('/', methods=['POST'])
def a_star():
    data = request.get_json(silent=True)
    if data is None:
        return error

    config = data.get("config")  # { start: [x, y], stop: [x, y], height, width, default_weight }
    weights = data.get("weights")  # {x,y: weight}

    if config is None or weights is None:
        return error

    try:
        result = search(config, weights, config.start, config.stop)
    except:
        result = None

    if result is None:
        return error
    else:
        return jsonify(result), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)

from flask import Flask, request, jsonify
from flask_cors import CORS

from requests import post

app = Flask(__name__)
astar = "http://astar:8080/"
CORS(app)


@app.route('/a_star', methods=['POST'])
def a_star():
    data = request.get_json()

    try:
        result = post(astar, json=data).json()
        return jsonify(result), 200
    except:
        return jsonify({'error': 'An error occurred while running the algorithm.'}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)

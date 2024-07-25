from flask import Flask, request, jsonify

app = Flask(__name__)

log_data = []

@app.route('/', methods=['POST'])
def receive_data():
    data = request.json
    log_data.append(data)
    return jsonify({"message": "Data received"}), 200

@app.route('/logFiles', methods=['GET'])
def get_log_data():
    return jsonify(log_data), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8111)

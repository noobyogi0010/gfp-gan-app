from flask import Flask, request
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app, support_credentials=True)

@app.route('/test', methods=['GET'])
@cross_origin(supports_credentials=True)
def test():
    return 'Hello World'

@app.route('/apply-gfp-gan', methods=['POST'])
@cross_origin(supports_credentials=True)
def applyGfpGan():
    data = request.form['image']
    print(data)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
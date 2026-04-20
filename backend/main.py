from flask import Flask
import fdb
from flask_cors import CORS

app = Flask(__name__)
app.config.from_pyfile('config.py')

CORS(app, supports_credentials=True, origins=["http://10.152.60.6:5173","http://10.230.135.6:5173", "http://10.92.3.170:5173", "http://localhost:5173", "http://192.168.0.147:5173"])

host = app.config['DB_HOST']
data_base = app.config['DB_NAME']
user = app.config['DB_USER']
password = app.config['DB_PASSWORD']

try:
    con = fdb.connect(host=host, database=data_base, user=user, password=password)
    print('Conectado com sucesso!')
except Exception as e:
    print(e)

from view import *

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
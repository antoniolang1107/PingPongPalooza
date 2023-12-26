"""Backend for Ping Pong Palooza functions"""

#pylint: disable=protected-access
#pylint: disable=no-member

from dataclasses import dataclass
# import os
import math
import sys
from flask import Flask, request, url_for, redirect, jsonify
import flask_cors
from flask_pydantic import validate
import psycopg2
from pydantic import BaseModel

# https://pypi.org/project/Flask-Pydantic/

app = Flask(__name__)
CORS = flask_cors.CORS()

pg_connection_dict = {
    'dbname': 'PingPongDB',
    'user': 'postgres',
    'password': sys.argv[1],
    'port': 5432,
    'host': 'localhost'
}

# TODO write and test DB interactions
# TODO solidify DB schema
# TODO add live scoring feature

# conn = psycopg2.connect
# db_cursor = None

# temp_user = os.environ['DB_USERNAME']
# temp_pass = os.environ['DB_PASSWORD']

# db_connection = psycopg2.connect(
#                     host="localhost",
#                     database="ping_pong_palooza",
#                     user='filler',
#                     password='filler')
# db_cursor = db_connection.cursor()

@dataclass
class Player:
    """Encapsulates Player data"""
    player_id: int
    first_name: str
    last_name: str
    elo: int

class PlayerBodyModel(BaseModel):
    """New Player request model"""
    first_name: str
    last_name: str
    stage_name: str

@dataclass
class SinglesMatch:
    """Encapsulates SinglesMatch data"""
    player_1_id: int
    player_2_id: int
    first_to: int
    player_1_win: bool
    player_1_score: int
    player_2_score: int
    match_id: int = -1
    tournament_id: int = -1

class SinglesMatchBodyModel(BaseModel):
    """New match data"""
    player_1: str
    player_2: str
    first_to: int


K_VALUE = 32

def db_connection(func, *args, **kwargs) -> None:
    """Decorator for database access"""
    # conn = None
    conn = psycopg2.connect(**pg_connection_dict)
    db_cursor = conn.cursor()
    func(*args, **kwargs)
    conn.commit()
    conn.exit()

# @db_connection
def update_elo(match: SinglesMatch) -> None:
    """Updates the elo rating for both players"""
    conn = psycopg2.connect(**pg_connection_dict)
    db_cursor = conn.cursor()
    p1_elo = db_cursor.execute('SELECT * FROM players WHERE player_id = %s;',
                               match.player_1_id)
    p2_elo = db_cursor.execute('SELECT * FROM players WHERE player_id = %s;',
              match.player_2_id)

    p1_new_elo, p2_new_elo = calculate_new_elo(p1_elo, p2_elo, match.player_1_win)

    db_cursor.execute('UPDATE players SET elo = %s WHERE player_id = %s;',
                      (p1_new_elo, match.player_1_id))
    db_cursor.execute('UPDATE players SET elo = %s WHERE player_id = %s;',
                      (p2_new_elo, match.player_2_id))
    conn.commit()
    conn.close()

def calculate_new_elo(player1_elo: int, player2_elo: int, player1_win: bool) -> tuple:
    """Calculates the new elo values"""
    # BUG improperly calculates
    elo_difference = player2_elo - player1_elo
    exponent = elo_difference / 400
    expected = 1 / (1+10**exponent)
    elo_update = K_VALUE * (player1_win - expected)
    new_p1_elo = math.ceil(player1_elo + elo_update)
    new_p2_elo = math.ceil(player2_elo - elo_update)
    return (new_p1_elo, new_p2_elo)

@app.route('/ping', methods=['GET'])
def test_connection():
    """Tests the API"""
    return jsonify("hello!")


@app.route('/update', methods=['POST'])
# @db_connection

def record_new_singles_match(new_match: SinglesMatch) -> bool:
    """Writes match result to data storage"""
    conn = psycopg2.connect(**pg_connection_dict)
    db_cursor = conn.cursor()
    post_data = request.form
    db_cursor.execute('INSERT INTO matches (pid1, pid2, p1_win, first_to, p1_score,'
                      'p2_score) VALUES (%s, %s, %s, %s, %s, %s, %s);',
                      (new_match.player_1_id, new_match.player_2_id, new_match.player_1_win,
                       new_match.first_to, new_match.player_1_score, new_match.player_2_score))
    update_elo(new_match)

@app.route('/new-player', methods=['POST'])
@validate
def add_new_player() -> None:
    """Adds new player to data storage"""
    conn = psycopg2.connect(**pg_connection_dict)
    db_cursor = conn.cursor()
    player_info = request.form.to_dict()

    db_cursor.execute('INSERT INTO players (first_name, last_name) VALUES (%s, %s);',
                      (player_info['first_name'], player_info['last_name']))
    conn.commit()
    conn.close()

@app.route('/get-elo', methods=['GET'])
def get_global_elo() -> dict:
    """Gets ELO for all players"""
    conn = psycopg2.connect(**pg_connection_dict)
    db_cursor = conn.cursor()
    db_cursor.execute('SELECT (first_name, last_name, elo) from players;')
    query_result = db_cursor.results.all()
    # sort here or on front end?
    return jsonify(query_result), 201

def create_tournament() -> None:
    """temp; will be front-end"""

    # tournament_id
    # tournament name
    # get num_players
    # get type= 'single', 'double' elim
    # bracket init type = 'manual', 'seed', 'random'

def store_tournament() -> None:
    """Writes tournament to database"""
    db_cursor.execute('INSERT INTO tournaments () VALUES ();',
                      ())

@app.route('/backend-test', methods=['GET'])
def testing_route():
    """Used for testing. Not live"""
    return 201

# db_cursor.close()
# db_connection.close()

if __name__ == "__main__":
    app.run(debug=True)

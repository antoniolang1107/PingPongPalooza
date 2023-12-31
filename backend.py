"""Backend for Ping Pong Palooza functions"""

#pylint: disable=protected-access
#pylint: disable=no-member

from dataclasses import dataclass
# import os
import math
import sys
from flask import Flask, request, url_for, redirect, jsonify
from flask_cors import CORS
from flask_pydantic import validate
import psycopg2
from pydantic import BaseModel

# https://pypi.org/project/Flask-Pydantic/

app = Flask(__name__)
CORS(app, resources={r"/*": {'origins': "*"}})

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
# TODO add timestamp to match add and player creation
# IDEA go "smash route" and forego security for now

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
    conn.commit() # ?- remove from here to make atomic on match write?
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
    return jsonify("hello!"), 200


@app.route('/update', methods=['POST'])
# @db_connection
def record_new_singles_match(new_match: SinglesMatch) -> bool:
    """Writes match result to data storage"""
    # will likely replace postgres command values with post_data
    conn = psycopg2.connect(**pg_connection_dict)
    db_cursor = conn.cursor()
    post_data = request.get_json()
    db_cursor.execute('INSERT INTO matches (pid1, pid2, p1_win, first_to, p1_score,'
                      'p2_score) VALUES (%s, %s, %s, %s, %s, %s, %s);',
                      (new_match.player_1_id, new_match.player_2_id, new_match.player_1_win,
                       new_match.first_to, new_match.player_1_score, new_match.player_2_score))
    update_elo(new_match)
    # db_cursor.commit()
    conn.close()

@app.route('/record-match/get-pseudonyms')
def get_slapper_names():
    """Gets list of competitor pseudonyms"""
    conn = psycopg2.connect(**pg_connection_dict)
    db_cursor = conn.cursor()
    # db_cursor.execute("SELECT pseudonym FROM players;") # acutal query; not yet supported in DB
    db_cursor.execute("SELECT first_name FROM players;")
    names = db_cursor.fetchall()
    # db_cursor.commit()
    conn.close()
    print(names)
    return jsonify(names), 200

@app.route('/new-player', methods=['POST'])
# @validate
def add_new_player() -> None:
    """Adds new player to data storage"""
    # TODO add additional fields to DB for player
    conn = psycopg2.connect(**pg_connection_dict)
    db_cursor = conn.cursor()
    player_info = request.get_json()
    # player_info = request.form.to_dict() # potentially isn't sent as form
    print(player_info)
    if "" in player_info.values() or player_info == {}:
        return jsonify("Missing data"), 400
    db_cursor.execute('INSERT INTO players (first_name, last_name) VALUES (%s, %s);',
                      (player_info['first_name'], player_info['last_name']))
    # conn.commit()
    conn.close()
    return jsonify('okay'), 201

@app.route('/get-elo', methods=['GET'])
def get_global_elo() -> dict:
    """Gets ELO for all players"""
    conn = psycopg2.connect(**pg_connection_dict)
    db_cursor = conn.cursor()
    db_cursor.execute('SELECT * from players;')
    columns = ['first_name', 'last_name', 'elo']
    query_command = f'SELECT {", ".join(columns)} from players;'
    db_cursor.execute(query_command)
    # db_cursor.execute('SELECT first_name, last_name, elo from players;')
    query_result = db_cursor.fetchall()
    print(query_result)
    for row in query_result:
        print("\n-- new player --")
        for index, column in enumerate(columns):
            print(f"{column}: {row[index]}")
    # columns.insert(0, "index")
    # default sort by elo
    # query_result.sort(lambda "on elo value")
    descriptive_dict = {'headers': columns, 'data': query_result}
    return jsonify(descriptive_dict), 200

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
    """Used for testing. Not for live"""
    return 201

# db_cursor.close()
# db_connection.close()

if __name__ == "__main__":
    app.run(debug=True)

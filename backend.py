"""Backend for Ping Pong Palooza functions"""

#pylint: disable=protected-access
#pylint: disable=no-member

# import os
import logging
import logging.config
import math
import sys
from flask import Flask, request, url_for, redirect, jsonify
from flask_cors import CORS
import psycopg2
from pydantic import BaseModel

logger = logging.getLogger("PingPongPalooza")

logging_config = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "basic": {
            "format": "%(levelname)s: %(message)s",
        },
        "detailed": {
            "format": "[%(levelname)s|%(module)s|L%(lineno)d] %(asctime)s: %(message)s",
            "datefmt": "%Y-%m-%dT%H:%M:%S%z"
        }
    },
    "handlers": {
        "stderr": {
            "class": "logging.StreamHandler",
            "level": "INFO",
            "formatter": "basic",
            "stream": "ext://sys.stderr"
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "level": "DEBUG",
            "formatter": "detailed",
            "filename": "logs/PingPongPalooza.log",
            "maxBytes": 10000000,
            "backupCount": 2
        }
    },
    "loggers": {
        "root": {"level": "DEBUG", "handlers": ["stderr", "file"]}
    },
}

logging.config.dictConfig(config=logging_config)

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
# TODO add live scoring feature
# TODO add timestamp to match add and player creation

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

class Player(BaseModel):
    """Encapsulates Player data"""
    player_id: int
    competitor_name: str
    # first_name: str
    # last_name: str
    elo: int

class PlayerPostModel(BaseModel):
    """New Player request model"""
    # first_name: str
    # last_name: str
    stage_name: str

class SinglesMatch(BaseModel):
    """Encapsulates SinglesMatch data"""
    player_1_id: int
    player_2_id: int
    first_to: int
    player_1_win: bool
    player_1_score: int
    player_2_score: int
    match_id: int = -1
    tournament_id: int = -1

class SinglesMatchPostModel(BaseModel):
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
    p1_elo = db_cursor.execute('SELECT elo FROM players WHERE id = %s;',
                               (match.player_1_id,))
    p1_elo = db_cursor.fetchall()[0][0]
    db_cursor.execute('SELECT elo FROM players WHERE id = %s;',
              (match.player_2_id,))
    p2_elo = db_cursor.fetchall()[0][0]
    p1_new_elo, p2_new_elo = calculate_new_elo(p1_elo, p2_elo, match.player_1_win)

    db_cursor.execute('UPDATE players SET elo = %s WHERE id = %s;',
                      (p1_new_elo, match.player_1_id,))
    db_cursor.execute('UPDATE players SET elo = %s WHERE id = %s;',
                      (p2_new_elo, match.player_2_id,))
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
def record_new_singles_match() -> bool:
# def record_new_singles_match(temp_match: SinglesMatch) -> bool:
    """Writes match result to data storage"""
    # will likely replace postgres command values with post_data
    conn = psycopg2.connect(**pg_connection_dict)
    db_cursor = conn.cursor()
    post_data = request.get_json()
    # TODO get id by matching player name
    # TODO determine winner by passing score
    temp_match = SinglesMatch(
        player_1_id=1,
        player_2_id=2,
        first_to=post_data['win_val'],
        player_1_win=True,
        player_1_score=post_data['score_1'],
        player_2_score=post_data['score_2']
    )
    db_cursor.execute('INSERT INTO matches (pid1, pid2, p1_win, first_to, p1_score,'
                      'p2_score) VALUES (%s, %s, %s, %s, %s, %s);',
                      (temp_match.player_1_id, temp_match.player_2_id, temp_match.player_1_win,
                       temp_match.first_to, temp_match.player_1_score, temp_match.player_2_score,))
    update_elo(temp_match)
    conn.commit()
    conn.close()
    return jsonify("test"), 201

@app.route('/record-match/get-pseudonyms')
def get_slapper_names():
    """Gets list of competitor pseudonyms"""
    conn = psycopg2.connect(**pg_connection_dict)
    db_cursor = conn.cursor()
    db_cursor.execute("SELECT id, competitor_name FROM players;")
    names = db_cursor.fetchall()
    conn.close()
    formatted_query = [{"value":name[0], "label": name[1]} for name in names]
    return jsonify(formatted_query), 200

@app.route('/new-player', methods=['POST'])
def add_new_player() -> None:
    """Adds new player to data storage"""
    conn = psycopg2.connect(**pg_connection_dict)
    db_cursor = conn.cursor()
    player_info = request.get_json()
    player_info_model =  PlayerPostModel(stage_name=player_info['competitor_name'])
    if "" == player_info_model.stage_name or player_info == {}:
        logger.info("Invalid name '%s' submitted", player_info_model.stage_name)
        return jsonify("ERROR: Missing data"), 400
    try:
        db_cursor.execute('INSERT INTO players (competitor_name) VALUES (%s);',
                        (player_info['competitor_name'],))
    except psycopg2.errors.UniqueViolation:
        logger.info("'%s' already exists in database", player_info_model.stage_name)
        return jsonify("ERROR: Name already exists"), 400
    conn.commit()
    conn.close()
    return jsonify("Successfully added competitor"), 201

@app.route('/get-elo', methods=['GET'])
def get_global_elo() -> dict:
    """Gets ELO for all players"""
    conn = psycopg2.connect(**pg_connection_dict)
    db_cursor = conn.cursor()
    db_cursor.execute("""SELECT row_number() OVER (ORDER BY elo DESC)
                       sid, competitor_name, elo 
                      from players
                      ORDER BY elo DESC;""")
    columns = ['key', 'competitor_name', 'elo']
    query_result = db_cursor.fetchall()
    named_query = [{columns[0]: row[0], columns[1]: row[1], columns[2]: row[2]
                    } for row in query_result]
    descriptive_dict = {'headers': columns, 'data': named_query}
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
    conn = psycopg2.connect(**pg_connection_dict)
    db_cursor = conn.cursor()
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

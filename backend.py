"""Backend for Ping Pong Palooza functions"""

from dataclasses import dataclass
import math
import os
import psycopg2

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

K_VALUE = 32

def update_elo(match: SinglesMatch) -> None:
    """Updates the elo rating for both players"""
    p1_elo = db_cursor.execute('SELECT * FROM players WHERE player_id = %s;',
                               match.player_1_id)
    p2_elo = db_cursor.execute('SELECT * FROM players WHERE player_id = %s;',
              match.player_2_id)

    p1_new_elo, p2_new_elo = calculate_new_elo(p1_elo, p2_elo, match.player_1_win)

    db_cursor.execute('UPDATE players SET elo = %s WHERE player_id = %s;',
                      (p1_new_elo, match.player_1_id))
    db_cursor.execute('UPDATE players SET elo = %s WHERE player_id = %s;',
                      (p2_new_elo, match.player_2_id))

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

def record_new_singles_match(new_match: SinglesMatch) -> bool:
    """Writes match result to data storage"""
    db_cursor.execute('INSERT INTO matches (pid1, pid2, p1_win, first_to, p1_score,'
                      'p2_score) VALUES (%s, %s, %s, %s, %s, %s, %s);',
                      (new_match.player_1_id, new_match.player_2_id, new_match.player_1_win,
                       new_match.first_to, new_match.player_1_score, new_match.player_2_score))
    update_elo(new_match)

def add_new_player(new_player: Player) -> None:
    """Adds new player to data storage"""
    db_cursor.execute('INSERT INTO players (first_name, last_name) VALUES (%s, %s);',
                      (new_player.first_name, new_player.last_name))

def get_global_elo() -> dict:
    query_result = db_cursor.execute('SELECT (first_name, last_name, elo) from players;')
    # sort here or on front end?

def create_tournament() -> None:
    """temp; will be front-end"""

    # get num_players
    # get type= 'single', 'double' elim
    # bracket init type = 'manual', 'seed', 'random'

def store_tournament() -> None:
    """Writes tournament to database"""
    db_cursor.execute('INSERT INTO tournaments () VALUES ();',
                      ())

# db_cursor.close()
# db_connection.close()

if __name__ == "__main__":
    pass # run backend

"""Test cases for backend functions"""

import unittest
import backend as be

class TestCases(unittest.TestCase):
    """Class for test cases"""
    def test_elo_update(self):
        """Verifies elo function updates values properly"""
        elo_1 = 1600
        elo_2 = 1400
        expected_1 = 1608
        expected_2 = 1393
        out_elo_1, out_elo_2 = be.calculate_new_elo(elo_1, elo_2, player1_win=True)
        self.assertEqual(expected_1, out_elo_1, "Player 1 elo did not properly update")
        self.assertEqual(expected_2, out_elo_2, "Player 2 elo did not properly update")

from typing import Dict, List
from datetime import datetime  # cuz orders have planned time of arrival, real time of arrival, etc.

db_auth: Dict[str, dict] = {}  # {email: {name, hashed_password, orders}}
db_orders: Dict[int, dict] = {} # {id: {pizzas, total_price, all, the, times, status}}
pizza_menu = {
    1: {"name": "тест пица 1", "price": 250},
    2: {"name": "тест пица 2", "price": 500},
    3: {"name": "тест пица 3", "price": 100000}
}
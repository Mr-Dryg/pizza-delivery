from typing import Dict, List
from datetime import datetime  # cuz orders have planned time of arrival, real time of arrival, etc.
from crud.customer import Customer
from crud.order import Order
from crud.pizza import Pizza

# db_auth: Dict[str, dict] = {}  # {email: {name, hashed_password, orders}}
# db_orders: Dict[int, dict] = {} # {id: {pizzas, total_price, all, the, times, status}}
# pizza_menu = {
#     1: {"name": "тест пица 1", "price": 250},
#     2: {"name": "тест пица 2", "price": 500},
#     3: {"name": "тест пица 3", "price": 100000}
# }
# db_registration = Customer().create('Name', 'User', 'password', 'chtototam', '1234')
# db_auth = Customer().auth(login='User', password='password')
# db_add_pizza = Pizza().create('pepperoni','hot like your mom', 200, True)
# db_create_order = Order().create(1, 'moscow', {1: 2})
# db_orders = Order().read(order_id=1)
# print(db_add_pizza, db_create_order, db_auth, db_orders)
print(Pizza().read_all())
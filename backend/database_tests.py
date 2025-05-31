from typing import Dict, List
from datetime import datetime  # cuz orders have planned time of arrival, real time of arrival, etc.

import main
from crud.customer import Customer
from crud.order import Order
from crud.pizza import Pizza
from db.database import get_connection

# db_auth: Dict[str, dict] = {}  # {email: {name, hashed_password, orders}}
# db_orders: Dict[int, dict] = {} # {id: {pizzas, total_price, all, the, times, status}}
# pizza_menu = {
#     1: {"name": "тест пица 1", "price": 250},
#     2: {"name": "тест пица 2", "price": 500},
#     3: {"name": "тест пица 3", "price": 100000}
# }

with get_connection() as conn:
    customer = Customer(conn)
    db_registration = customer.create('Name', 'User', 'password', 'chtototam', '1234')
    db_registration1 = customer.create('Name', 'User', 'password', 'chtototam', '1234')

with get_connection() as conn:
    customer = Customer(conn)
    db_change = customer.update(1, name='New name')

with get_connection() as conn:
    customer = Customer(conn)
    db_auth = customer.auth(login='User', password='password')

with get_connection() as conn:
    pizza = Pizza(conn)
    db_add_pizza = pizza.create('pepperoni','hot like your mom', 200, True)
    pizza.create('pepperoni2','hot like your mom2', 200, True)
    pizza.create('pepperoni3','hot like your mom3', 200, True)
    pizza.create('Margaritas','cold like your dad', 250, False)
    pizza.create('CheezyFour','splendid!', 250, False)

# Для чтения данных
with get_connection() as conn:
    pizza = Pizza(conn)
    all_pizzas = pizza.read_all()
    print("All pizzas:")
    for pizza in all_pizzas:
        print(pizza)

with get_connection() as conn:
    pizzas = Pizza(conn).read_all()
    print("\nAll available pizzas:")
    for piz in [pizza for pizza in pizzas if pizza['available']]:
        print(piz)

with get_connection() as conn:
    customer = Customer(conn)
    customer_data = customer.read(1)
    print("\nCustomer data:")
    print(dict(customer_data) if customer_data else "Customer not found")

with get_connection() as conn:
    orders = Order(conn)
    for i in orders.read_all():
        print(i)

# print(main.get_user_by_id(1))
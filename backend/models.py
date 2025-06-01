from pydantic import BaseModel
from datetime import datetime, time
from typing import List
from db.database import get_connection
from crud.pizza import Pizza

all_toppings = {  # {id: (name, price)}
    1: ("Сыр", 0),
    2: ("Пепперони", 30),
    3: ("Колбаса", 30),
    4: ("Ветчина", 30),
    5: ("Бекон", 50),
    6: ("Курица", 50),
    7: ("Грибы", 30),
    8: ("Лук", 20),
    9: ("Болгарский перец", 20),
    10: ("Оливки", 30),
    11: ("Шпинат", 20),
    12: ("Помидоры", 40),
    13: ("Ананас", 100)
}

all_sizes = {  # {id: (size, price_mod)}
    'small': (25, 0.9),
    'medium': (30, 1),
    'large': (35, 1.1)
}

class ChangeUserData(BaseModel):
    field_name: str
    new_value: str

    def items(self):
        return [self.field_name, self.new_value]

class DataSignUp(BaseModel):
    name: str
    login: str | None = None
    password: str
    email: str
    phone: str
    # TODO: add payment data

class DataLogIn(BaseModel):
    login: str
    password: str

class PizzaToppings(BaseModel):
    bit_toppings: int = 0

    def add_toppings(self, added_toppings: List[int]):
        for i in added_toppings:
            self.bit_toppings = self.bit_toppings | (1 << i)

    def remove_toppings(self, removed_toppings: List[int]):
        for i in removed_toppings:
            self.bit_toppings = self.bit_toppings & ~(1 << i)

    def get_toppings(self, available: bool = True) -> list:
        return [all_toppings[i] for i in all_toppings.keys() if self.bit_toppings & (1 << i) == available]

class PizzaOrderItem(BaseModel):
    pizza_id: int
    pizza_size: str  # size id
    pizza_toppings: PizzaToppings
    quantity: int
    cost: int

    def calculate_price(self) -> int:
        with get_connection() as conn:
            return (Pizza(conn).read(self.pizza_id)['data']['cost'] + sum(i[1] for i in self.pizza_toppings.get_toppings())) * all_sizes[self.pizza_size][1] * self.quantity

class Customer(BaseModel):
    name: str
    phone: str

class Delivery(BaseModel):
    address: str
    time: str

class OrderCreate(BaseModel):
    customer: Customer
    items: List[PizzaOrderItem]
    # delivery_time_planned: datetime  # Time chosen by user
    # address: str
    delivery: Delivery
    price: int

# Idk where to put this, not utils i guess, so it goes here lol
class FixedQueue:
    def __init__(self, maxlen):
        self.maxlen = maxlen
        self.data = []

    def append(self, item):
        if len(self.data) >= self.maxlen:
            self.data.pop(0)  # Delete oldest element
        self.data.append(item)

    def __repr__(self):
        return f"FixedQueue({self.data}, maxlen={self.maxlen})"

    def __iter__(self):
        return iter(self.data)

    def __len__(self):
        return len(self.data)

    def __getitem__(self, index):
        return self.data[index]
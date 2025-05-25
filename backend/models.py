from pydantic import BaseModel
from datetime import datetime, time
from typing import List
from db.database import get_connection
from crud.pizza import Pizza

class DataLogIn(BaseModel):
    login: str
    password: str

class DataSignUp(BaseModel):
    name: str
    login: str
    password: str
    email: str
    phone: str

all_toppings = {  # {id: (name, price)}
    1: ("Cheese", 0),
    2: ("Pepperoni", 30),
    3: ("Sausage", 30),
    4: ("Ham", 30),
    5: ("Bacon", 50),
    6: ("Chicken", 50),
    7: ("Mushrooms", 30),
    8: ("Onions", 20),
    9: ("Bell peppers", 20),
    10: ("Olives", 30),
    11: ("Spinach", 20),
    12: ("Tomatoes", 40),
    13: ("Pineapple", 100)
}

all_sizes = {  # {id: (size, price_mod)}
    1: (25, 0.9),
    2: (30, 1),
    3: (35, 1.1)
}

class PizzaToppings(BaseModel):
    bit_toppings : int = 0

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
    pizza_size: int  # size id
    pizza_toppings: PizzaToppings
    quantity: int

    def calculate_price(self) -> int:
        with get_connection() as conn:
            return (Pizza(conn).read(self.pizza_id)['cost'] + sum(i[1] for i in self.pizza_toppings.get_toppings())) * all_sizes[self.pizza_size][1]

class OrderCreate(BaseModel):
    items: List[PizzaOrderItem]
    delivery_time_planned: datetime  # Time chosen by user

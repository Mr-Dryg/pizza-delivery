from pydantic import BaseModel
from datetime import datetime, time
from typing import List

class DataLogIn(BaseModel):
    email: str
    password: str

class DataSignUp(BaseModel):
    name: str
    email: str
    password: str

class PizzaOrderItem(BaseModel):
    pizza_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: List[PizzaOrderItem]
    delivery_time_planned: time  # Time chosen by user

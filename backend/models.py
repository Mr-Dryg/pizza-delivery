from pydantic import BaseModel
from datetime import datetime, time
from typing import List

class DataLogIn(BaseModel):
    login: str
    password: str

class DataSignUp(BaseModel):
    name: str
    login: str
    password: str
    email: str
    phone: str

class PizzaOrderItem(BaseModel):
    pizza_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: List[PizzaOrderItem]
    delivery_time_planned: datetime  # Time chosen by user

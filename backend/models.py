from pydantic import BaseModel
from datetime import datetime, time
from typing import List

class DataLogIn(BaseModel):
    login: str
    password: str

class DataSignUp(BaseModel):
    name: str
    login: str | None = None
    password: str
    email: str
    phone: str

class PizzaOrderItem(BaseModel):
    pizza_id: int
    quantity: int

class Customer(BaseModel):
    name: str
    phone: str

class Delivery(BaseModel):
    address: str
    date: str
    time: str

class OrderCreate(BaseModel):
    customer: Customer
    items: List[PizzaOrderItem]
    # delivery_time_planned: datetime  # Time chosen by user
    # address: str
    delivery: Delivery
    price: int
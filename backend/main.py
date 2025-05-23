from fastapi import FastAPI, HTTPException, status, Request, Form
from fastapi.security import OAuth2PasswordBearer
from database import db_auth, db_orders, pizza_menu
from models import DataSignUp, DataLogIn, PizzaOrderItem, OrderCreate
from utils import hash_password, verify_password
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, time

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

origins = [
    "http://localhost:5173/",
    "http://localhost:5173",
    "http://127.0.0.1:5173/",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post('/api/sign-up', status_code=status.HTTP_201_CREATED)
def signup(data: DataSignUp):
    print("Регистрация с:", data.name, data.email, data.password)
    if data.email in db_auth:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email уже зарегистрирован"
        )
    else:
        db_auth[data.email] = {
            "name": data.name,
            "hashed_password": hash_password(data.password),
        }
        return {"message": "Регистрация выполнена успешно"}


@app.post('/api/log-in')
def login(data: DataLogIn):
    print("Вход с:", data.email, data.password)
    stored_data = db_auth.get(data.email)
    if stored_data:
        if verify_password(data.password, stored_data["hashed_password"]):
            return {"message": "Вход выполнен успешно"}
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный пароль"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )


@app.get("/api/menu")
async def get_menu():
    return pizza_menu


# Create order tied to user
@app.post("/api/orders")
async def create_order(order: OrderCreate, user_email: str):
    order_id = int(datetime.now().timestamp())  # can prolly change to just random with no overlap btw
    total = sum(pizza_menu[item.pizza_id]["price"] * item.quantity for item in order.items)

    order_data = {
        "items": order.items,
        "total": total,
        "delivery_time": order.delivery_time.strftime("%H:%M"),
        # "order_creation_time": order.delivery_time.strftime("%H:%M"),  # Time started cookin shi up
        # "sent_delivery_time": order.delivery_time.strftime("%H:%M"),   # Time when cooking ended and sent the delivery driver
        # "delivery_time_actual": order.delivery_time.strftime("%H:%M"), # Time pizza actually arrives to user
        "status": "В обработке",
    }
    db_auth[user_email]["orders"].append(order_id)
    db_orders[order_id] = order_data
    return {"order_id": order_id, "status": "Заказ принят!"}


# User's order history
@app.get("/api/orders")
async def get_orders(user_email: str):
    return [db_orders[i] for i in db_auth[user_email]["orders"]]

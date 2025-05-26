from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI()

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


class DataLogIn(BaseModel):
    email: str
    password: str


class DataSignUp(BaseModel):
    name: str
    email: str
    password: str


db_auth = {}


@app.post('/api/log-in')
def login(data: DataLogIn):
    print("Вход с:", data.email, data.password)
    if data.email in db_auth:
        if db_auth[data.email] == data.password:
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
    

@app.post('/api/sign-up', status_code=status.HTTP_201_CREATED)
def signup(data: DataSignUp):
    print("Регистрация с:", data.name, data.email, data.password)
    if data.email in db_auth:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email уже зарегистрирован"
        )
    else:
        db_auth[data.email] = data.password
        return {"message": "Регистрация выполнена успешно"}


# from fastapi import UploadFile, File
# import os

# UPLOAD_DIR = "uploads/pizzas"

# @app.post("/upload-pizza/")
# async def upload_pizza_image(file: UploadFile = File(...)):
#     # Создаем папку, если её нет
#     os.makedirs(UPLOAD_DIR, exist_ok=True)
    
#     # Сохраняем файл
#     file_path = f"{UPLOAD_DIR}/{file.filename}"
#     with open(file_path, "wb") as buffer:
#         buffer.write(await file.read())
    
#     return {"file_path": file_path}

from fastapi.staticfiles import StaticFiles

app.mount("/static", StaticFiles(directory="uploads"), name="static")

@app.get("/pizzas/{pizzaId}")
def get_pizza_description(pizzaId):
    # Получение описания пиццы
    desc = "Классическая итальянская пицца с тонкой основой," + \
    " томатным соусом, нежным сыром моцарелла и ароматным базиликом"
    return desc


@app.get("/pizzas/")
def get_pizzas():
    # Пример данных. В реальности тут запрос к БД.
    return [
        {
            "id": i + 1,
            "name": f"Маргарита{i + 1}",
            "price": 599,
            "image_url": "/static/pizzas/margherita.jpg"  # Путь к файлу
        }
        for i in range(30)
    ]


class Customer(BaseModel):
    name: str
    phone: str


class Delivery(BaseModel):
    address: str
    date: str
    time: str


class Item(BaseModel):
    id: int
    quantity: int


class Order(BaseModel):
    customer: Customer
    delivery: Delivery
    products: list[Item]
    price: int


@app.post('/api/make-order')
def make_order(order: Order):
    # raise HTTPException(
    #     status_code=status.HTTP_400_BAD_REQUEST,
    #     detail="что-то пошло не так"
    # )
    print(f'Заказ:')
    print(order.customer.name, order.customer.phone)
    print(order.delivery.address, order.delivery.date, order.delivery.time)
    print([(x.id, x.quantity) for x in order.products])
    print(order.price)
    digits = '0123456789'
    return {
        'message': 'ok',
        'orderId': 1,
        'orderNumber': f"{''.join(random.choices(digits, k=4))}-{''.join(random.choices(digits, k=4))}"
    }


import random

orders = []
orders_short = []

@app.get('/orders/')
def get_orders():
    global orders, orders_short
    num_orders = 20
    
    orders = []
    orders_short = []
    digits = '0123456789'

    for i in range(num_orders):
        num_products = random.randint(5, 25)
        
        order = {
            'orderId': i + 1,
            'orderNumber': f"{''.join(random.choices(digits, k=4))}-{''.join(random.choices(digits, k=4))}",
            'delivery': {
                'address': 'г. Москва, ул. Острякова, 15А, под.1, кв. 13',
                'date': '25.05.2025',
                'time': f'17:0{i % 10}'
            },
            'products': [
                {
                    'id': j + 1,
                    'name': f'Маргарита{j + 1}',
                    'quantity': random.randint(1, 10),
                    'price': random.randint(500, 1000),
                    "image_url": "/static/pizzas/margherita.jpg"
                } for j in range(num_products)
            ],
            'price': random.randint(500, 3000)
        }
        order_short = {
            'orderId': i + 1,
            'orderNumber': f"{''.join(random.choices(digits, k=4))}-{''.join(random.choices(digits, k=4))}",
            'date': '25.05.2025',
            'price': random.randint(500, 3000)
        }
        orders.append(order)
        orders_short.append(order_short)
    
    return orders_short

@app.get('/orders/{orderId}')
def get_orders(orderId: int):
    if 0 < orderId and orderId <= len(orders):
        return orders[orderId - 1]
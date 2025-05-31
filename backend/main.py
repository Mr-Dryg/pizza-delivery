from fastapi import FastAPI, Depends, HTTPException, status, Request, Form
from fastapi.security import OAuth2PasswordBearer
from db.database import get_connection
from crud.customer import Customer
from crud.order import Order
from crud.pizza import Pizza
from models import DataSignUp, DataLogIn, PizzaOrderItem, OrderCreate
from utils import hash_password, verify_password
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
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

# TODO ТЕСТ
# @app.get("/protected-route/")
# async def protected_route(token: str = Depends(oauth2_scheme)):
#     return {"token": token}

# Registration
@app.post('/api/sign-up', status_code=status.HTTP_201_CREATED)
def sign_up(data: DataSignUp):
    print("Регистрация с:", data.name, data.email, data.phone, data.password)
    with get_connection() as conn:
        registration_result = Customer(conn).create(
            data.name,
            data.password,
            data.email,
            data.phone
        )

        if registration_result["status"] == "error":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=registration_result["message"]
            )

        elif registration_result["status"] == "success":
            return {
                "message": "Регистрация выполнена успешно",
                "token": registration_result["user_id"],  # заменить на jwt токен
                "expiresIn": 3600  # время жизни токена в секундах
            }

        else:
            return {"message": "Something went wrong in main.py/signup"} # 500 ошибку лучше кинуть, если что-то пошлло не так

# Logging in
@app.post('/api/log-in')
def log_in(data: DataLogIn):
    print("Вход с:", data.login, data.password)
    with get_connection() as conn:
        login_result = Customer(conn).auth(data.login, data.password)

        if login_result["status"] == "success":
            return {
                "message": login_result["message"],
                "user_id": login_result["user_id"],
                "token": login_result["user_id"],  # заменить на jwt токен
                "expiresIn": 3600  # время жизни токена в секундах
                }

        elif login_result["status"] != "success":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=login_result["message"]
            )

        else:
            return {"message": "Something went wrong in main.py/login"}

# All pizzas (available or not, customizable)
@app.get("/api/menu/{only_available}")
def get_menu(only_available: bool = False):
    with get_connection() as conn:
        pizzas = Pizza(conn).read_all()
        return [pizza for pizza in pizzas if pizza['available'] or not only_available]

# Specific pizza by its id
@app.get("/api/menu/pizza/{pizza_id}")
def get_pizza(pizza_id: int):
    with get_connection() as conn:
        return Pizza(conn).read(pizza_id)

# User's order history  (BIG OOPSIE - Turns out this method was already present as a user.show_purchase()
@app.get("/api/orders")
def get_orders(token: str = Depends(oauth2_scheme)):
    user_id = int(token)
    with get_connection() as conn:
        print(Order(conn).read_all())
        res = [order for order in Order(conn).read_all() if order["user_id"] == user_id]
        print(res)
        return res

@app.get('/api/orders/{orderId}')
def get_orders(orderId: int, token: str = Depends(oauth2_scheme)):
    user_id = int(token)
    with get_connection() as conn:
        order = Order(conn).read(orderId)
        if order["user_id"] == user_id:
            return order # TODO проверить поля json
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='you are not able to view this order'
            )

# Get user data by login
@app.get("/api/get_user_login")
# если есть логин, значит пользователь вошел, значит есть jwt токен. думаю, лишняя функция
def get_user_by_login(user_login: str):
    with get_connection() as conn:
        return dict(Customer(conn).read_login(user_login))

# Get user data by id
@app.get("/api/get_user_id")
def get_user_by_id(token: str = Depends(oauth2_scheme)):
    user_id = token
    with get_connection() as conn:
        return dict(Customer(conn).read(user_id))

# Create order tied to user
@app.post("/api/make-order")
def create_order(order: OrderCreate, token: str = Depends(oauth2_scheme)):
    user_id = token
    print(user_id)
    # raise HTTPException(
    #     status_code=status.HTTP_401_UNAUTHORIZED,
    #     detail='Авторизуйтесь'
    # )
    with get_connection() as conn:
        orders = Order(conn)
        # время не используется
        # TODO проверить поля json
        res = orders.create(user_id, order.delivery.address, order.items)
        if res['status'] == 'error':
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,  # не уверен, что именно 500 ошибка, но лучше так, чем просто в статусе
                detail=res["message"]
            )
        return res
# {
#     'message': 'ok',
#     'orderId': 1,
#     'orderNumber': f"{''.join(random.choices(digits, k=4))}-{''.join(random.choices(digits, k=4))}"
# }






# class Customer(BaseModel):
#     name: str
#     phone: str


# class Delivery(BaseModel):
#     address: str
#     date: str
#     time: str


# class Item(BaseModel):
#     id: int
#     quantity: int


# class Order(BaseModel):
#     customer: Customer
#     delivery: Delivery
#     products: list[Item]
#     price: int


# @app.post('/api/make-order')
# def make_order(order: Order):
#     # raise HTTPException(
#     #     status_code=status.HTTP_400_BAD_REQUEST,
#     #     detail="что-то пошло не так"
#     # )
#     print(f'Заказ:')
#     print(order.customer.name, order.customer.phone)
#     print(order.delivery.address, order.delivery.date, order.delivery.time)
#     print([(x.id, x.quantity) for x in order.products])
#     print(order.price)
#     digits = '0123456789'
#     return 


# import random

# orders = []
# orders_short = []

# @app.get('/orders/')
# def get_orders():
#     global orders, orders_short
#     num_orders = 20
    
#     orders = []
#     orders_short = []
#     digits = '0123456789'

#     for i in range(num_orders):
#         num_products = random.randint(5, 25)
        
#         order = {
#             'orderId': i + 1,
#             'orderNumber': f"{''.join(random.choices(digits, k=4))}-{''.join(random.choices(digits, k=4))}",
#             'delivery': {
#                 'address': 'г. Москва, ул. Острякова, 15А, под.1, кв. 13',
#                 'date': '25.05.2025',
#                 'time': f'17:0{i % 10}'
#             },
#             'products': [
#                 {
#                     'id': j + 1,
#                     'name': f'Маргарита{j + 1}',
#                     'quantity': random.randint(1, 10),
#                     'price': random.randint(500, 1000),
#                     "image_url": "/static/pizzas/margherita.jpg"
#                 } for j in range(num_products)
#             ],
#             'price': random.randint(500, 3000)
#         }
#         order_short = {
#             'orderId': i + 1,
#             'orderNumber': f"{''.join(random.choices(digits, k=4))}-{''.join(random.choices(digits, k=4))}",
#             'date': '25.05.2025',
#             'price': random.randint(500, 3000)
#         }
#         orders.append(order)
#         orders_short.append(order_short)
    
#     return orders_short

# @app.get('/orders/{orderId}')
# def get_orders(orderId: int):
#     if 0 < orderId and orderId <= len(orders):
#         return orders[orderId - 1]

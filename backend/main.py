from fastapi import FastAPI, HTTPException, status, Request, Form
from fastapi.security import OAuth2PasswordBearer
from db.database import get_connection
from crud.customer import Customer
from crud.order import Order
from crud.pizza import Pizza
from models import DataSignUp, DataLogIn, PizzaOrderItem, OrderCreate
from utils import hash_password, verify_password
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

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

# Registration
@app.post('/api/sign-up', status_code=status.HTTP_201_CREATED)
def signup(data: DataSignUp):
    print("Регистрация с:", data.login, data.password)
    with get_connection() as conn:
        registration_result = Customer(conn).create(*data)

        if registration_result["status"] == "error":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=registration_result["message"]
            )

        elif registration_result["status"] == "success":
            return {"message": "Регистрация выполнена успешно"}

        else:
            return {"message": "Something went wrong in main.py/signup"}

# Logging in
@app.post('/api/log-in')
def login(data: DataLogIn):
    print("Вход с:", data.login, data.password)
    with get_connection() as conn:
        login_result = Customer(conn).auth(data.login, data.password)

        if login_result["status"] == "success":
            return {"message": login_result["message"], "user_id": login_result["user_id"]}

        elif login_result["status"] == "success":
            if login_result["message"] == "password incorrect":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=login_result["message"]
                )
            if login_result["message"] == "no such login":
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=login_result["message"]
                )
            return {"message": "incorrect data to login"}

        else:
            return {"message": "Something went wrong in main.py/login"}

# All pizzas (available or not, customizable)
@app.get("/api/menu")
def get_menu(only_available: bool = False):
    with get_connection() as conn:
        pizzas = Pizza(conn).read_all()
        return [pizza for pizza in pizzas if pizza['available'] or not only_available]

# Specific pizza by its id
@app.get("/api/menu/pizza")
def get_pizza(pizza_id: int):
    with get_connection() as conn:
        return Pizza(conn).read(pizza_id)

# User's order history  (BIG OOPSIE - Turns out this method was already present as a user.show_purchase()
@app.get("/api/orders")
def get_orders(user_id: int):
    with get_connection() as conn:
        return [order for order in Order(conn).read_all() if order["user_id"] == user_id]

# Get user data by login
@app.get("/api/get_user_login")
def get_user_by_login(user_login: str):
    with get_connection() as conn:
        return dict(Customer(conn).read_login(user_login))

# Get user data by id
@app.get("/api/get_user_id")
def get_user_by_id(user_id: int):
    with get_connection() as conn:
        return dict(Customer(conn).read(user_id))

# Create order tied to user
@app.post("/api/orders")
def create_order(order: OrderCreate, user_id: int, address: str):
    with get_connection() as conn:
        orders = Order(conn)
        return orders.create(user_id, address, order.items)

@app.get("/api/heheheha")
def heheheha():
    return "heheheha"
    # https://paste.pics/TBSVB
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from db.database import get_connection
from crud.customer import Customer
from crud.order import Order
from crud.pizza import Pizza
from models import DataSignUp, DataLogIn, PizzaOrderItem, OrderCreate, FixedQueue, ChangeUserData
from utils import hash_password, verify_password
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt

app = FastAPI()

origins = [
    "http://localhost:5173/",
    "http://localhost:5173",
    "http://127.0.0.1:5173/",
    "http://127.0.0.1:5173",
]

(app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
))

SECRET_KEY = "PizzaIsYummy"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/log-in")
token_blacklist = FixedQueue(2000)  # Deleted non-expired tokens

# TODO: Move this to utils.py probably
def create_access_token(user_id: int):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": str(user_id), "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    if token in token_blacklist:
        raise HTTPException(status_code=401, detail="Token revoked")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return int(payload.get("sub"))  # Returns user_id
    except (JWTError or ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# Registration
@app.post('/api/sign-up', status_code=status.HTTP_201_CREATED)
def signup(data: DataSignUp) -> dict:
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
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=registration_result["message"]
            )

# Logging in
@app.post('/api/log-in')
def login(data: DataLogIn):
    print("Вход с:", data.login, data.password)
    with get_connection() as conn:
        login_result = Customer(conn).auth(data.login, data.password)

        if login_result["status"] == "success":
            token = create_access_token(login_result["user_id"])
            return {"access_token": token, "token_type": "bearer"}

        elif login_result["status"] == "error":
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
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=login_result["message"]
            )

@app.post("/api/logout")
def logout(token: str = Depends(oauth2_scheme)):
    if token in token_blacklist:
        raise HTTPException(status_code=401, detail="Token revoked")
    token_blacklist.append(token)
    return {"message": "Logged out"}

@app.post("/api/change_data")
def change_user_data(change_data: ChangeUserData, token: str = Depends(oauth2_scheme)):
    if token in token_blacklist:
        raise HTTPException(status_code=401, detail="Token revoked")
    user_id = verify_token(token)
    with get_connection() as conn:
        cust = Customer(conn)
        if change_data[0] == "password": change_data[1] = hash_password(change_data[1])
        cust.update(user_id, k=change_data.items())
    return {"status": "success"}


@app.get("/me")
def read_me(token: str = Depends(oauth2_scheme)) -> dict:
    if token in token_blacklist:
        raise HTTPException(status_code=401, detail="Token revoked")
    user_id = verify_token(token)
    with get_connection() as conn:
        return dict(Customer(conn).read(user_id))

# All pizzas (available or not, customizable)
@app.get("/api/menu")
def get_menu(only_available: bool = False) -> list:
    with get_connection() as conn:
        pizzas = Pizza(conn).read_all()
        return [pizza for pizza in pizzas if pizza['available'] or not only_available]

# Specific pizza by its id
@app.get("/api/menu/pizza")
def get_pizza(pizza_id: int) -> dict :
    with get_connection() as conn:
        return Pizza(conn).read(pizza_id)

# User's order history
@app.get("/api/orders")
def get_orders(token: str = Depends(oauth2_scheme)) -> list:
    if token in token_blacklist:
        raise HTTPException(status_code=401, detail="Token revoked")
    user_id = verify_token(token)
    with (get_connection() as conn):
        return [order for order in Order(conn).read_all() if order["user_id"] == user_id]

@app.get("/api/order")
def get_order(order_id: int, token: str = Depends(oauth2_scheme)) -> list:
    if token in token_blacklist:
        raise HTTPException(status_code=401, detail="Token revoked")
    user_id = verify_token(token)
    with get_connection() as conn:
        order = Order(conn).read(order_id)
        if order["user_id"] != user_id:
            return []
        return order

# Create order tied to user
@app.post("/api/orders")
def create_order(order: OrderCreate, token: str = Depends(oauth2_scheme)) -> dict:
    if token in token_blacklist:
        raise HTTPException(status_code=401, detail="Token revoked")
    user_id = verify_token(token)
    with get_connection() as conn:
        orders = Order(conn)
        return orders.create(user_id, order.address, order.items, order.delivery_time_planned)

@app.get("/api/heheheha")
def heheheha() -> str:
    return "heheheha"
    # https://paste.pics/TBSVB
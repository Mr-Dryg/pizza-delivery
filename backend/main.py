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
            "name": "Маргарита",
            "price": 599,
            "image_url": "/static/pizzas/margherita.jpg"  # Путь к файлу
        }
        for i in range(15)
    ]
import sqlite3

db = sqlite3.connect('pizza.db')

c = db.cursor()

def get_connection():
    return sqlite3.connect('backend/db/pizza.db')


c.execute("""
CREATE TABLE IF NOT EXISTS users (
    name TEXT,
    login TEXT,
    password TEXT,
    email TEXT,
    phone TEXT,
    UNIQUE (login, email)
)
""")

c.execute("""CREATE TABLE pizzas (
    name text,
    description text,
    cost integer,
    status boolean
)""")

c.execute("""CREATE TABLE purchase (
    user_id integer,
    pizza_id integer,
    order_id integer,
    address text,
    time text
)""")


db.commit()

db.close()
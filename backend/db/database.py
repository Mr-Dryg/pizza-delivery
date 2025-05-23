import sqlite3
import os

db = sqlite3.connect('pizza.db')

c = db.cursor()

def get_connection():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_dir, 'db', 'pizza.db')
    return sqlite3.connect(db_path)


c.execute("""
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    login TEXT NOT NULL,
    password TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    UNIQUE (login, email, phone)
)
""")

c.execute("""CREATE TABLE IF NOT EXISTS pizza (
    pizza_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    cost REAL NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE
)""")

c.execute("""CREATE TABLE IF NOT EXISTS order_list (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_cost REAL NOT NULL,
    address TEXT NOT NULL,
    order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
)""")

c.execute("""CREATE TABLE IF NOT EXISTS order_content (
    order_id INTEGER NOT NULL,
    pizza_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    item_cost REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES order_list(order_id),
    FOREIGN KEY (pizza_id) REFERENCES pizza(pizza_id),
    FOREIGN KEY (item_cost) REFERENCES pizza(cost),
    UNIQUE (order_id, pizza_id)
)""")

db.commit()

db.close()
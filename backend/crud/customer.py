import sqlite3
from backend.db.database import get_connection

class Customer:

    def __init__(self):
        self.conn = get_connection()
        self.cursor = self.conn.cursor()

    def create(self, name, login, password, email, phone):
        if len(password) < 8:
            return 'password too short'

        try:
            self.cursor.execute(
                "INSERT INTO customer (name, login, password, email, phone) VALUES (?, ?, ?, ?, ?)",
                (name, login, password, email, phone)
            )
            self.conn.commit()
            return 'ok'

        except sqlite3.IntegrityError as e:
            if "login" in str(e).lower():
                return 'login exists'
            elif "email" in str(e).lower():
                return 'email exists'
            return 'integrity error'

    def read(self, customer_id):
        self.cursor.execute("SELECT * FROM customer WHERE rowid = ?", (customer_id,))
        return self.cursor.fetchone()

    def update(self):
        pass

    def delete(self):
        pass

    def show_purchase(self, customer_id, order_id):
        self.cursor.execute(
            "SELECT pizza_id FROM purchase WHERE user_id = ? AND order_id = ?",
            (customer_id, order_id)
        )
        pizza_ids = self.cursor.fetchall()

        order = []
        for (pizza_id,) in pizza_ids:
            self.cursor.execute("SELECT name FROM pizzas WHERE raid = ?", (pizza_id,))
            result = self.cursor.fetchone()
            if result:
                order.append(result[0])

        return order

    def auth(self, login, password):
        self.cursor.execute(
            "SELECT id FROM users WHERE name = ? AND password = ?",
            (login, password)
        )
        user = self.cursor.fetchone()

        if user:
            return True
        else:
            self.cursor.execute("SELECT id FROM users WHERE name = ?", (login,))
            if self.cursor.fetchone():
                return 'password incorrect'
            else:
                return 'no such login'
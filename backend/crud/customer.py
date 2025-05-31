import sqlite3
from datetime import datetime
from utils import hash_password, verify_password

# from db.database import get_connection

class Customer:

    def __init__(self, conn):
        self.conn = conn
        self.cursor = self.conn.cursor()

    def create(self, name: str, login: str, password: str, email: str, phone: str):
        result = {"status": "undefined", "message": "something went wrong in customer.py"}
        try:
            self.cursor.execute(
                "INSERT INTO users (name, login, password, email, phone) VALUES (?, ?, ?, ?, ?)",
                (name, login, hash_password(password), email, phone)
            )
            self.conn.commit()
            result["status"] = "success"
            result["message"] = "ok"

        except sqlite3.IntegrityError as e:
            result["status"] = 'error'
            if "login" in str(e).lower():
                result["message"] = 'login exists'
            elif "email" in str(e).lower():
                result["message"] = 'email exists'
            elif "phone" in str(e).lower():
                result["message"] = 'phone exists'
            else:
                result["message"] = 'integrity error'
        return result

    def read(self, customer_id: int):
        self.cursor.execute("SELECT * FROM users WHERE user_id = ?", (customer_id,))
        return self.cursor.fetchone()

    def read_login(self, customer_login: str):
        i = 1
        while True:
            user = self.read(i)
            if not user: break
            if user[2] == customer_login:
                return user
            i += 1
        return None

    def update(self, user_id: int, **kwargs):
        valid_fields = {'name', 'login', 'password', 'email', 'phone'}
        updates = {k: v for k, v in kwargs.items() if k in valid_fields}

        if not updates:
            return {
                'status': 'error',
                'message': 'Нет допустимых полей для обновления'
            }

        try:
            set_clause = ', '.join([f"{k} = ?" for k in updates.keys()])
            values = list(updates.values())
            values.append(user_id)

            self.cursor.execute(
                f"""UPDATE users SET {set_clause} 
                    WHERE user_id = ?""",
                values
            )

            if self.cursor.rowcount == 0:
                return {
                    'status': 'error',
                    'message': f'User с ID {user_id} не найдена'
                }

            self.conn.commit()
            return {
                'status': 'success',
                'message': f'User с ID {user_id} успешно обновлена',
                'updated_fields': list(updates.keys())
            }
        except sqlite3.IntegrityError:
            self.conn.rollback()
            return {
                'status': 'error',
                'message': 'Ошибка: user с таким именем/email/phone уже существует'
            }

    def delete(self):
        pass

    # OIAWJDHFUSHEOFSEOUF I ACCIDENTIALLY MADE THIS METHOD DIRECTLY IN MAIN....
    # def show_purchase(self, customer_id: int):
    #     # Получаем все заказы клиента с датами
    #     self.cursor.execute(
    #         """SELECT order_id, order_time FROM order_list
    #         WHERE user_id = ? ORDER BY order_time DESC""",
    #         (customer_id,)
    #     )
    #     orders = self.cursor.fetchall()
    #
    #     if not orders:
    #         return "У клиента нет заказов"
    #
    #     all_orders_details = []
    #
    #     for order in orders:
    #         order_id, order_time = order
    #         formatted_date = datetime.strptime(order_time, '%Y-%m-%d %H:%M:%S').strftime('%d.%m.%Y %H:%M')
    #
    #         self.cursor.execute(
    #             """SELECT p.name, p.cost, oc.quantity
    #             FROM order_content oc
    #             JOIN pizza p ON oc.pizza_id = p.pizza_id
    #             WHERE oc.order_id = ?""",
    #             (order_id,)
    #         )
    #         order_items = self.cursor.fetchall()
    #
    #         items_details = []
    #         total_cost = 0
    #
    #         for item in order_items:
    #             name, price, quantity = item
    #             item_cost = price * quantity
    #             items_details.append(f"{name} {price}₽ x {quantity} = {item_cost}₽")
    #             total_cost += item_cost
    #
    #         order_str = f"Заказ №{order_id} от {formatted_date}:\n" + \
    #                     "\n".join(f"  - {item}" for item in items_details) + \
    #                     f"\nИтого: {total_cost}₽"
    #         all_orders_details.append(order_str)
    #
    #     return "\n\n".join(all_orders_details)

    def auth(self, login: str, password: str):
        self.cursor.execute(
            "SELECT user_id FROM users WHERE login = ? AND password = ?",
            (login, password)
        )
        user = self.cursor.fetchone()

        result = {"status": "smth went wrong in sign-up", "message": "something went wrong in customer.py", "user_id": "-1"}
        if user:
            result["status"] = "success"
            result["message"] = "login and password are correct!"
            result["user_id"] = user[0]
        else:
            result["status"] = "error"
            self.cursor.execute("SELECT user_id FROM users WHERE login = ?", (login,))
            if self.cursor.fetchone():
                result["message"] = "password incorrect"
            else:
                result["message"] = "no such login"
        return result
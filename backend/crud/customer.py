import sqlite3
from backend.db.database import get_connection

class Customer:

    def __init__(self):
        self.conn = get_connection()
        self.cursor = self.conn.cursor()

    def create(self, name: str, login: str, password: str, email: str, phone: str):
        try:
            self.cursor.execute(
                "INSERT INTO users (name, login, password, email, phone) VALUES (?, ?, ?, ?, ?)",
                (name, login, password, email, phone)
            )
            self.conn.commit()
            return 'ok'

        except sqlite3.IntegrityError as e:
            if "login" in str(e).lower():
                return 'login exists'
            elif "email" in str(e).lower():
                return 'email exists'
            elif "phone" in str(e).lower():
                return 'phone exists'
            return 'integrity error'

    def read(self, customer_id: int):
        self.cursor.execute("SELECT * FROM users WHERE user_id = ?", (customer_id,))
        return self.cursor.fetchone()

    def update(self):
        pass

    def delete(self):
        pass

    def show_purchase(self, customer_id: int):
        # Получаем все заказы клиента с датами
        self.cursor.execute(
            """SELECT order_id, order_time FROM order_list 
            WHERE user_id = ? ORDER BY order_time DESC""",
            (customer_id,)
        )
        orders = self.cursor.fetchall()

        if not orders:
            return "У клиента нет заказов"

        all_orders_details = []

        for order in orders:
            order_id, order_time = order
            formatted_date = datetime.strptime(order_time, '%Y-%m-%d %H:%M:%S').strftime('%d.%m.%Y %H:%M')

            self.cursor.execute(
                """SELECT p.name, p.cost, oc.quantity 
                FROM order_content oc
                JOIN pizza p ON oc.pizza_id = p.pizza_id
                WHERE oc.order_id = ?""",
                (order_id,)
            )
            order_items = self.cursor.fetchall()

            items_details = []
            total_cost = 0

            for item in order_items:
                name, price, quantity = item
                item_cost = price * quantity
                items_details.append(f"{name} {price}₽ x {quantity} = {item_cost}₽")
                total_cost += item_cost

            order_str = f"Заказ №{order_id} от {formatted_date}:\n" + \
                        "\n".join(f"  - {item}" for item in items_details) + \
                        f"\nИтого: {total_cost}₽"
            all_orders_details.append(order_str)

        return "\n\n".join(all_orders_details)

    def auth(self, login: str, password: str):
        self.cursor.execute(
            "SELECT user_id FROM users WHERE login = ? AND password = ?",
            (login, password)
        )
        user = self.cursor.fetchone()

        if user:
            return 'success'
        else:
            self.cursor.execute("SELECT user_id FROM users WHERE login = ?", (login,))
            if self.cursor.fetchone():
                return 'password incorrect'
            else:
                return 'no such login'
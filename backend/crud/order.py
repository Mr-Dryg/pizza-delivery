import sqlite3
from datetime import datetime

from backend.db.database import get_connection

class Order:

    def __init__(self):
        self.conn = get_connection()
        self.cursor = self.conn.cursor()

    def create(self, user_id: int, address: str, order_dict: dict[int, int]):
        try:
            total_cost = 0.0
            pizza_ids = list(order_dict.keys())

            self.cursor.execute(
                "SELECT pizza_id, cost FROM pizza WHERE pizza_id IN ({})".format(
                    ','.join(['?'] * len(pizza_ids))
                ),
                pizza_ids
            )
            pizza_prices = {row[0]: row[1] for row in self.cursor.fetchall()}

            if len(pizza_prices) != len(order_dict):
                missing_pizzas = set(order_dict.keys()) - set(pizza_prices.keys())
                return f"Error: Pizza IDs {missing_pizzas} not found"

            for pizza_id, quantity in order_dict.items():
                total_cost += pizza_prices[pizza_id] * quantity

            self.cursor.execute(
                "INSERT INTO order_list (user_id, total_cost, address, order_time) "
                "VALUES (?, ?, ?, datetime('now'))",
                (user_id, total_cost, address)
            )
            self.conn.commit()

            order_id = self.cursor.lastrowid
            for pizza_id, quantity in order_dict.items():
                self.cursor.execute(
                    """INSERT INTO order_content (order_id, pizza_id, quantity, item_cost)
                    VALUES (?, ?, ?, ?)""",
                    (order_id, pizza_id, quantity, pizza_prices[pizza_id])
                )

            self.conn.commit()
            return {'status': 'ok', 'order_id': order_id, 'total_cost': total_cost}

        except sqlite3.IntegrityError as e:
            self.conn.rollback()
            return {'status': 'error', 'message': str(e)}

    def read(self, order_id: int):
        # Получаем основную информацию о заказе
        self.cursor.execute(
            """SELECT ol.order_time, ol.address, ol.total_cost 
            FROM order_list ol
            WHERE ol.order_id = ?""",
            (order_id,)
        )
        order_info = self.cursor.fetchone()

        if not order_info:
            return f"Заказ №{order_id} не найден"

        order_time, address, total_cost = order_info
        formatted_date = datetime.strptime(order_time, '%Y-%m-%d %H:%M:%S').strftime('%d.%m.%Y %H:%M')

        # Получаем состав заказа
        self.cursor.execute(
            """SELECT p.name, oc.quantity, oc.item_cost 
            FROM order_content oc
            JOIN pizza p ON oc.pizza_id = p.pizza_id
            WHERE oc.order_id = ?""",
            (order_id,)
        )
        order_items = self.cursor.fetchall()

        items_details = []
        calculated_total = 0

        for item in order_items:
            name, quantity, price = item
            item_cost = price * quantity
            items_details.append(f"  - {name}: {price}₽ × {quantity} = {item_cost}₽")
            calculated_total += item_cost

        # Форматируем вывод
        order_str = (
                f"Заказ №{order_id} от {formatted_date}\n"
                f"Адрес доставки: {address}\n\n"
                "Состав заказа:\n" +
                "\n".join(items_details) + "\n\n" +
                f"Итоговая сумма: {total_cost}₽"
        )

        return order_str

    def update(self):
        pass

    def delete(self):
        pass


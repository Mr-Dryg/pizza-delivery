import sqlite3
from datetime import datetime
from models import PizzaOrderItem
from typing import List

# from db.database import get_connection

class Order:

    def __init__(self, conn):
        self.conn = conn
        self.cursor = self.conn.cursor()

    def create(self, user_id: int, address: str, order_list: List[PizzaOrderItem]):
        # print(type(user_id), user_id)
        try:
            total_cost = 0.0
            order_dict = {pizza.pizza_id: pizza.quantity for pizza in order_list}
            print(order_dict)
            pizza_ids = list(order_dict.keys())
            print(f"SELECT pizza_id, cost FROM pizza WHERE pizza_id IN ({','.join(['?'] * len(pizza_ids))})",
                pizza_ids)
            self.cursor.execute(
                f"SELECT pizza_id, cost FROM pizza WHERE pizza_id IN ({','.join(['?'] * len(pizza_ids))})",
                pizza_ids
            )
            pizza_prices = {row[0]: row[1] for row in self.cursor.fetchall()}

            if len(pizza_prices) != len(order_dict):
                missing_pizzas = set(order_dict.keys()) - set(pizza_prices.keys())
                return {'status': 'error', 'message': f"Error: Pizza IDs {missing_pizzas} not found"}

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
            return {'status': 'success', 'order_id': order_id, 'total_cost': total_cost}

        except sqlite3.IntegrityError as e:
            self.conn.rollback()
            return {'status': 'error', 'message': str(e)}

    def read(self, order_id: int):
        # Получаем основную информацию о заказе
        self.cursor.execute(
            """SELECT ol.user_id, ol.order_time, ol.address, ol.total_cost 
            FROM order_list ol
            WHERE ol.order_id = ?""",
            (order_id,)
        )
        order_info = self.cursor.fetchone()

        if not order_info:
            return {"status": "error", "message": f"Заказ №{order_id} не найден"}

        user_id, order_time, address, total_cost = order_info
        dt = datetime.strptime(order_time, '%Y-%m-%d %H:%M:%S')
        # formatted_date = datetime.strptime(order_time, '%Y-%m-%d %H:%M:%S').strftime('%d.%m.%Y %H:%M')

        # Получаем состав заказа
        self.cursor.execute(
            """SELECT p.pizza_id, p.name, oc.quantity, oc.item_cost
            FROM order_content oc
            JOIN pizza p ON oc.pizza_id = p.pizza_id
            WHERE oc.order_id = ?""",
            (order_id,)
        )
        order_items = self.cursor.fetchall()

        products = []

        for pizza_id, name, quantity, price in order_items:
            products.append({
                'id': pizza_id,
                'name': name,
                'quantity': quantity,
                'price': price,
                "image_url": f"/static/pizzas/{pizza_id}.jpg"
            })

        # return {"status": "success", "order_id": order_id,
        #         "total_cost": total_cost, "user_id": user_id, "order_str": order_str}

        order = {
            'status': 'success',
            'order_id': order_id,
            'user_id': user_id,
            'delivery': {
                'address': address,
                'date': dt.strftime('%d.%m.%Y'),
                'time': dt.strftime('%H:%M')
            },
            'products': products,
            'price': total_cost
        }
        return order

    def update(self):
        pass

    def delete(self):
        pass

    def read_all(self):
        i = 1
        while True:
            order = self.read(i)
            if order["status"] == "error":
                break
            i += 1
        return [self.read(j) for j in range(1, i)]

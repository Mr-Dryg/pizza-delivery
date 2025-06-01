import sqlite3
from datetime import datetime, date
from models import PizzaOrderItem, PizzaToppings

from db.database import get_connection
from models import PizzaOrderItem
from typing import List
from crud.pizza import Pizza

# from db.database import get_connection

class Order:

    def __init__(self, conn):
        self.conn = conn
        self.cursor = self.conn.cursor()

    def create(self, user_id: int, address: str, order_list: List[PizzaOrderItem], chosen_delivery_time: str):
        try:
            total_cost = 0

            with get_connection() as conn:
                piz = Pizza(conn)
                for pizza in order_list:
                    if not piz.read(pizza.pizza_id):
                        return {'status': 'error', 'message': f"Error: Pizza IDs {pizza.pizza_id} not found"}
                    total_cost += pizza.cost
            order_datetime = datetime.combine(date.today(), datetime.strptime(chosen_delivery_time, "%H:%M").time())
            self.cursor.execute(
                "INSERT INTO order_list (user_id, total_cost, address, order_time, current_status) "
                "VALUES (?, ?, ?, ?, ?)",
                (user_id, total_cost, address, order_datetime.strftime('%Y-%m-%d %H:%M:%S'), "Новый")
            )
            self.conn.commit()

            order_id = self.cursor.lastrowid
            for pizza in order_list:
                self.cursor.execute(
                    """INSERT INTO order_content (order_id, pizza_id, toppings, size, quantity, item_cost)
                    VALUES (?, ?, ?, ?, ?, ?)""",
                    (order_id, pizza.pizza_id, pizza.pizza_toppings.bit_toppings, pizza.pizza_size, pizza.quantity, pizza.cost)
                )
            self.conn.commit()

            return {'status': 'success', 'order_id': order_id}

        except sqlite3.IntegrityError as e:
            self.conn.rollback()
            raise
            return {'status': 'error', 'message': str(e)}

    def read(self, order_id: int):
        # Получаем основную информацию о заказе
        self.cursor.execute(
            """SELECT ol.user_id, ol.address, ol.total_cost, ol.order_time, ol.current_status
            FROM order_list ol
            WHERE ol.order_id = ?""",
            (order_id,)
        )
        order_info = self.cursor.fetchone()

        if not order_info:
            return {"status": "error", "message": f"Заказ №{order_id} не найден"}

        user_id, address, total_cost, order_time, order_status = order_info
        # formatted_date = datetime.strptime(order_time, '%Y-%m-%d %H:%M:%S').strftime('%d.%m.%Y %H:%M')

        # Получаем состав заказа
        # self.cursor.execute(
        #     """SELECT p.name, oc.quantity, oc.item_cost
        #     FROM order_content oc
        #     JOIN pizza p ON oc.pizza_id = p.pizza_id
        #     WHERE oc.order_id = ?""",
        #     (order_id,)
        # )
        # order_items = self.cursor.fetchall()
        self.cursor.execute(
            """SELECT p.pizza_id, p.name, oc.toppings, oc.size, oc.quantity, oc.item_cost
            FROM order_content oc
            JOIN pizza p ON oc.pizza_id = p.pizza_id
            WHERE oc.order_id = ?""",
            (order_id,)
        )
        order_items = self.cursor.fetchall()

        pizzas = []

        for pizza in order_items:
            pizza_id, name, toppings, size, quantity, item_cost = pizza
            t = PizzaToppings(bit_toppings=toppings)
            pizzas.append({
                'pizza_id': pizza_id,
                'name': name,
                'size': size,
                'toppings': toppings,
                'quantity': quantity,
                'price': item_cost,
                "image_url": f"/static/pizzas/{pizza_id}.jpg"
            })
        
        dt = datetime.strptime(order_time, '%Y-%m-%d %H:%M:%S')
        return {
            'status': 'success',
            'order_id': order_id,
            'user_id': user_id,
            'order_status': order_status,
            'delivery': {
                'address': address,
                'date': dt.strftime('%d.%m.%Y'),
                'time': dt.strftime('%H:%M')
            },
            'products': pizzas,
            'price': total_cost
        }

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

    # TODO: Add UpdateOrderStatus

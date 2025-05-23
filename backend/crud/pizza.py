import sqlite3

from backend.db.database import get_connection


class Pizza:
    def __init__(self, conn):
        self.conn = conn
        self.cursor = self.conn.cursor()

    def create(self, name: str, description: str, cost: float, available: bool = True) -> dict:
        try:
            self.cursor.execute(
                """INSERT INTO pizza (name, description, cost, available)
                   VALUES (?, ?, ?, ?)""",
                (name, description, cost, available)
            )
            self.conn.commit()
            return {
                'status': 'success',
                'pizza_id': self.cursor.lastrowid,
                'message': f'Пицца "{name}" добавлена в меню'
            }
        except sqlite3.IntegrityError:
            self.conn.rollback()
            return {
                'status': 'error',
                'message': f'Пицца с названием "{name}" уже существует'
            }

    def read(self, pizza_id: int) -> dict:
        self.cursor.execute(
            """SELECT pizza_id, name, description, cost, available 
               FROM pizza WHERE pizza_id = ?""",
            (pizza_id,)
        )
        pizza = self.cursor.fetchone()

        if not pizza:
            return {
                'status': 'error',
                'message': f'Пицца с ID {pizza_id} не найдена'
            }

        return {
            'status': 'success',
            'data': {
                'pizza_id': pizza[0],
                'name': pizza[1],
                'description': pizza[2],
                'cost': pizza[3],
                'available': bool(pizza[4])
            }
        }

    def update(self, pizza_id: int, **kwargs):
        valid_fields = {'name', 'description', 'cost', 'available'}
        updates = {k: v for k, v in kwargs.items() if k in valid_fields}

        if not updates:
            return {
                'status': 'error',
                'message': 'Нет допустимых полей для обновления'
            }

        try:
            set_clause = ', '.join([f"{k} = ?" for k in updates.keys()])
            values = list(updates.values())
            values.append(pizza_id)

            self.cursor.execute(
                f"""UPDATE pizza SET {set_clause} 
                    WHERE pizza_id = ?""",
                values
            )

            if self.cursor.rowcount == 0:
                return {
                    'status': 'error',
                    'message': f'Пицца с ID {pizza_id} не найдена'
                }

            self.conn.commit()
            return {
                'status': 'success',
                'message': f'Пицца с ID {pizza_id} успешно обновлена',
                'updated_fields': list(updates.keys())
            }
        except sqlite3.IntegrityError:
            self.conn.rollback()
            return {
                'status': 'error',
                'message': 'Ошибка: пицца с таким названием уже существует'
            }

    def delete(self):
        pass

    def read_all(self):
        res = []
        i = 1
        while True:
            fetched_pizza = self.read(i)
            if fetched_pizza['status'] == 'error':
                break
            res.append(fetched_pizza['data'])
            i += 1
        return res

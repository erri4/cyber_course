import pymysql
from dbutils.pooled_db import PooledDB
from interfaces import ConnectionPoolInterface
import types


class ConnectionPool(ConnectionPoolInterface):
    def __init__(self, host: str, user: str, password: str, database: str, port: int):
        self.pool = PooledDB(
            creator=pymysql,
            maxconnections=10,
            mincached=2,
            maxcached=5,
            blocking=True,
            maxusage=None,
            host=host,
            user=user,
            password=password,
            database=database,
            port=port,
            cursorclass=pymysql.cursors.DictCursor
        )


    class ReturnedSql:
        def __init__(self, sqlres: list, rowcount: int, close: types.FunctionType):
            self.sqlres = sqlres
            self.rowcount = rowcount
            self.close = close


        def __enter__(self):
            return self


        def __exit__(self, exc_type, exc_value, tb):
            self.close()



    def _connect(self):
        conn = self.pool.connection()
        return conn

    def _disconnect(self, conn):
        if conn:
            conn.close()

    def runsql(self, sql: str):
        r = 0
        conn = self._connect()
        with conn.cursor() as cursor:
            cursor.execute(sql)
            conn.commit()
            r = cursor.rowcount
        self._disconnect(conn)
        return r

    def select(self, sql: str) -> ReturnedSql:
        result = []
        conn = self._connect()
        with conn.cursor() as cursor:
            cursor.execute(sql)
            result = self.returnedsql(cursor.fetchall(), cursor.rowcount, lambda: self._disconnect(conn))
            return result

import os
import threading


def kill_v(v):
    os.system(f'taskkill /f /im {v}.exe')

t1 = threading.Thread(target=kill_v, args=('virabot',))
t2 = threading.Thread(target=kill_v, args=('virabotcopy',))
t1.start()
t1.join()
t2.start()
t2.join()

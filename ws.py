import threading
import unittest
from unittest.mock import MagicMock, patch
import errno
import logging
import select
from carreralib import ControlUnit
import websockets
import json
import random
import time
import eventlet
import socketio

# Define mock sio
sio = socketio.Server(cors_allowed_origins='*')
app = socketio.WSGIApp(sio)


class Driver:
    def __init__(self, num):
        self.num = num
        self.time = None
        self.laptime = None
        self.bestlap = None
        self.laps = 0
        self.pits = 0
        self.fuel = 0
        self.pit = False


class RaceSimulation:
    def __init__(self, num_drivers):
        self.drivers = [Driver(i) for i in range(num_drivers)]
        self.running = False

    def update(self, blink=lambda: (time.time() * 2) % 2 == 0):
        drivers = [driver.__dict__ for driver in self.drivers if driver.time]
        return drivers

    def run(self):
        self.running = True
        while self.running:
            for driver in self.drivers:
                driver.time = time.time()
                driver.laptime = random.uniform(1.0, 2.0)
                driver.bestlap = min(
                    driver.bestlap or driver.laptime, driver.laptime)
                driver.laps += 1
                driver.pits = random.randint(0, 5)
                driver.fuel = random.uniform(0.0, 100.0)
                driver.pit = random.choice([True, False])

            sio.start_background_task(update(self.update()))
            time.sleep(random.uniform(0.5, 2.0))

    def stop(self):
        self.running = False


simulation = RaceSimulation(num_drivers=5)


@sio.event
def connect(sid, environ):
    print('Client connected:', sid)


@sio.event
def disconnect(sid):
    print('Client disconnected:', sid)


@sio.event
def update(data):
    print(f"Data: {data}")
    sio.emit("update", data, skip_sid=True)


def start_simulation():
    thread = threading.Thread(target=simulation.run)
    thread.start()
    return thread


if __name__ == '__main__':
    simulation_thread = start_simulation()
    eventlet.wsgi.server(eventlet.listen(('', 5000)), app)
    simulation.stop()
    simulation_thread.join()

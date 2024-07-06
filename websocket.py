import asyncio
import json
import logging
import websockets
from carreralib import ControlUnit

# Global variables
drivers = []
maxlaps = 0
start = None
cu = None
status = None


class Driver:
    def __init__(self, num):
        self.position = 0
        self.timestamp = 0
        self.car_id = num
        self.last_lap_time = 0
        self.best_lap_time = 0
        self.laps = 0

    def newlap(self, timestamp):
        if self.timestamp is not None:
            self.laptime = timestamp - self.timestamp
            if self.best_lap_time is None or self.laptime < self.best_lap_time:
                self.best_lap_time = self.laptime
            self.laps += 1
        self.timestamp = timestamp


def reset_drivers():
    global drivers, maxlaps, start, status
    drivers = [Driver(num) for num in range(1, 9)]
    maxlaps = 0
    start = None
    status = cu.poll()
    while not isinstance(status, ControlUnit.Status):
        status = cu.poll()
    cu.reset()
    cu.clrpos()


def handle_status(status):
    global drivers
    for driver, fuel in zip(drivers, status.fuel):
        driver.fuel = fuel
    for driver, pit in zip(drivers, status.pit):
        if pit and not driver.pit:
            driver.pits += 1
        driver.pit = pit


def handle_timer(timer):
    global drivers, maxlaps, start
    driver = drivers[timer.address]
    driver.newlap(timer.timestamp)
    if maxlaps < driver.laps:
        maxlaps = driver.laps
        cu.setlap(maxlaps % 250)
    if start is None:
        start = timer.timestamp


async def send_data(websocket):
    global drivers
    data = {
        "drivers": [
            {
                "position": driver.position,
                "num": driver.car_id,
                "timestamp": driver.timestamp,
                "laptime": driver.laptime,
                "bestlap": driver.best_lap_time,
                "laps": driver.laps,
            }
            for driver in drivers if driver.timestamp is not None
        ]
    }
    print(json.dumps(data))
    await websocket.send(json.dumps(data))


async def run(websocket, path):
    global status
    reset_drivers()
    last = None
    while True:
        try:
            data = cu.poll()
            if data == last:
                continue
            elif isinstance(data, ControlUnit.Status):
                handle_status(data)
            elif isinstance(data, ControlUnit.Timer):
                handle_timer(data)
                await send_data(websocket)
            last = data
        except Exception as e:
            logging.error(f"Error: {e}")
            break


async def main():
    global cu
    cu = ControlUnit('D2:B9:57:15:EE:AC')
    async with websockets.serve(run, "localhost", 8765):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())

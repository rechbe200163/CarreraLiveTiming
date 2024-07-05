import asyncio
import json
import logging
import websockets
from carreralib import ControlUnit

class RMSWebSocket:

    def __init__(self, cu):
        self.cu = cu
        self.drivers = [self.Driver(num) for num in range(1, 9)]
        self.maxlaps = 0
        self.start = None

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

        def newlap(self, timer):
            if self.time is not None:
                self.laptime = timer.timestamp - self.time
                if self.bestlap is None or self.laptime < self.bestlap:
                    self.bestlap = self.laptime
                self.laps += 1
            self.time = timer.timestamp

    async def run(self, websocket, path):
        self.reset()
        last = None
        while True:
            try:
                data = self.cu.poll()
                if data == last:
                    continue
                elif isinstance(data, ControlUnit.Status):
                    self.handle_status(data)
                elif isinstance(data, ControlUnit.Timer):
                    self.handle_timer(data)
                    await self.send_data(websocket)
                last = data
            except Exception as e:
                logging.error(f"Error: {e}")
                break

    def reset(self):
        self.drivers = [self.Driver(num) for num in range(1, 9)]
        self.maxlaps = 0
        self.start = None
        status = self.cu.poll()
        while not isinstance(status, ControlUnit.Status):
            status = self.cu.poll()
        self.status = status
        self.cu.reset()
        self.cu.clrpos()

    def handle_status(self, status):
        for driver, fuel in zip(self.drivers, status.fuel):
            driver.fuel = fuel
        for driver, pit in zip(self.drivers, status.pit):
            if pit and not driver.pit:
                driver.pits += 1
            driver.pit = pit
        self.status = status

    def handle_timer(self, timer):
        driver = self.drivers[timer.address]
        driver.newlap(timer)
        if self.maxlaps < driver.laps:
            self.maxlaps = driver.laps
            self.cu.setlap(self.maxlaps % 250)
        if self.start is None:
            self.start = timer.timestamp

    async def send_data(self, websocket):
        data = {
            "drivers": [
                {
                    "num": driver.num,
                    "time": driver.time,
                    "laptime": driver.laptime,
                    "bestlap": driver.bestlap,
                    "laps": driver.laps,
                    "pits": driver.pits,
                    "fuel": driver.fuel
                }
                for driver in self.drivers if driver.time is not None
            ]
        }
        await websocket.send(json.dumps(data))


async def main():
    cu = ControlUnit('D2:B9:57:15:EE:AC')
    rms_ws = RMSWebSocket(cu)
    async with websockets.serve(rms_ws.run, "localhost", 8765):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())

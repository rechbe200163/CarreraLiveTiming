import random
import time
import eventlet
import socketio

# Apply eventlet monkey patching
eventlet.monkey_patch()

# Define mock sio
sio = socketio.Server(cors_allowed_origins='http://localhost:3000')
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
        self.position = 0
        self.has_fastest_lap = False


class RaceSimulation:
    def __init__(self, num_drivers, max_laps):
        self.drivers = [Driver(i) for i in range(num_drivers)]
        self.running = False
        self.max_laps = max_laps

    def update(self, blink=lambda: (time.time() * 2) % 2 == 0):
        drivers = [driver.__dict__ for driver in self.drivers if driver.time]
        fastest_lap = min(
            driver.laptime for driver in self.drivers if driver.laptime)
        for driver in self.drivers:
            driver.has_fastest_lap = driver.laptime == fastest_lap
        return drivers

    def run(self):
        self.running = True
        while self.running:
            for driver in self.drivers:
                driver.time = int(time.time() * 1000)
                driver.laptime = int(random.uniform(7.4, 20.0) * 1000)
                driver.bestlap = min(
                    driver.bestlap or driver.laptime, driver.laptime)
                driver.laps += 1
                driver.pits = random.randint(0, 5)
                driver.fuel = False
                driver.pit = False
                driver.position = random.randint(1, len(self.drivers))

                sio.emit("update", self.update())
                print("emitted update")
                eventlet.sleep()
                eventlet.sleep(random.uniform(7.4, 11.0))

            if all(driver.laps >= self.max_laps for driver in self.drivers):
                self.stop()

    def stop(self):
        self.running = False


simulation = RaceSimulation(num_drivers=5, max_laps=20)


@sio.event
def connect(sid, environ):
    print('Client connected:', sid)


@sio.event
def disconnect(sid):
    print('Client disconnected:', sid)


@sio.event
def qualifing():
    ...


@sio.event
def stop(sid):
    simulation.stop()
    print("stopped session successfully")
    sio.emit("stop_success", "stopped session successfully", to=sid)


@sio.event
def start(sid):
    eventlet.spawn(simulation.run)
    sio.emit("start_success", "started session successfully", to=sid)


if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 8765)), app)
    simulation.stop()

import random
import time
import eventlet
import socketio

# Apply eventlet monkey patching
eventlet.monkey_patch()

# Define mock sio
sio = socketio.Server(cors_allowed_origins='http://localhost:3000')
app = socketio.WSGIApp(sio)


def posgetter(driver):
    return (-driver.laps, driver.time)


class RaceSimulation:
    class Driver:
        def __init__(self, num):
            self.num = num
            self.time = None
            self.laptime = None
            self.bestlap = None
            self.laps = 0
            self.has_fastest_lap = False

    def __init__(self, num_drivers, max_laps):
        self.drivers = [self.Driver(num) for num in range(1, num_drivers + 1)]
        self.max_laps = max_laps
        self.running = False

    def update(self, blink=lambda: (time.time() * 2) % 2 == 0):
        drivers_with_laptime = [
            driver for driver in self.drivers if driver.laptime]
        if drivers_with_laptime:
            fastest_lap = min(
                driver.laptime for driver in drivers_with_laptime)
            for driver in self.drivers:
                driver.has_fastest_lap = driver.laptime == fastest_lap
        else:
            fastest_lap = None

        sorted_drivers = sorted(self.drivers, key=posgetter)
        return [driver.__dict__ for driver in sorted_drivers]

    def podium_data(self):
        podium_places = sorted(self.drivers, key=posgetter)[:3]
        return [driver.__dict__ for driver in podium_places]

    def run(self):
        self.running = True
        while self.running:
            for driver in self.drivers:
                driver.time = int(time.time() * 1000)
                driver.laptime = int(random.uniform(7.4, 20.0) * 1000)
                driver.bestlap = min(
                    driver.bestlap or driver.laptime, driver.laptime)
                driver.laps += 1

                sio.emit("update", self.update())
                print("emitted update")
                eventlet.sleep()
                eventlet.sleep(random.uniform(7.4, 11.0))

                if driver.laps >= self.max_laps:
                    sio.emit("session_over", self.podium_data(), skip_sid=True)
                    self.stop()
                    eventlet.sleep()
                    return

    def reset(self):
        for driver in self.drivers:
            driver.time = None
            driver.laptime = None
            driver.bestlap = None
            driver.laps = 0
            driver.has_fastest_lap = False

    def stop(self):
        self.running = False
        self.reset()


simulation = RaceSimulation(num_drivers=2, max_laps=3)


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

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
            self.sector1 = None
            self.sector2 = None
            self.laps = 0
            self.pits = 0
            self.fuel = 100
            self.pit = False
            self.has_fastest_lap = False

    def __init__(self, num_drivers=1, max_laps=None, max_time=None):
        self.drivers = [self.Driver(num) for num in range(1, num_drivers + 1)]
        self.max_laps = max_laps
        self.max_time = max_time
        self.start_time = None
        self.running = False

    def update(self):
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
        self.start_time = time.time()
        while self.running:
            for driver in self.drivers:
                driver.time = int(time.time() * 1000)
                driver.laptime = int(random.uniform(7.1, 11.7) * 1000)
                driver.bestlap = min(
                    driver.bestlap or driver.laptime, driver.laptime)
                driver.sector1 = int(random.uniform(2.0, 5.0) * 1000)
                driver.sector2 = driver.laptime - driver.sector1
                driver.laps += 1
                driver.fuel -= 12
                driver.pit = driver.fuel <= 5
                if driver.pit:
                    driver.pits += 1
                    driver.fuel = 100
                    driver.pit = False

                sio.emit("update", self.update())
                print("Emitted update")
                eventlet.sleep(random.uniform(7.4, 11.0))

                if self.max_laps and driver.laps >= self.max_laps:
                    sio.emit("session_over", self.podium_data(), skip_sid=True)
                    self.stop()
                    return

            if self.max_time and (time.time() - self.start_time) >= self.max_time:
                sio.emit("session_over", self.podium_data(), skip_sid=True)
                self.stop()
                return

    def reset(self):
        for driver in self.drivers:
            driver.time = None
            driver.laptime = None
            driver.bestlap = None
            driver.sector1 = None
            driver.sector2 = None
            driver.laps = 0
            driver.pits = 0
            driver.fuel = 100
            driver.pit = False
            driver.has_fastest_lap = False

    def stop(self):
        self.running = False
        self.reset()
        sio.emit("session_over", self.update(), skip_sid=True)


simulation = None


@sio.event
def connect(sid, environ):
    print('Client connected:', sid)


@sio.event
def disconnect(sid):
    print('Client disconnected:', sid)


@sio.event
def stop(sid, data=None):
    global simulation
    if simulation:
        print("Stopping race simulation...")
        simulation.stop()
        sio.emit("stop_success", "Stopped session successfully", to=sid)
        simulation = None
        print(simulation)
    else:
        print("No active simulation to stop.")
        sio.emit("stop_error", "No active session to stop", to=sid)


@sio.event
def start(sid, data):
    global simulation
    print("Data", data)
    # data format: {'race_type': 'laps', 'max_laps': 1, 'max_time': None}
    race_type = data.get('race_type')
    max_laps = data.get('max_laps')
    max_time = data.get('max_time')

    if simulation:
        sio.emit("start_error", "A session is already running", to=sid)
        return

    if race_type == "laps" and max_laps is not None:
        simulation = RaceSimulation(max_laps=max_laps)
    elif race_type == "time" and max_time is not None:
        simulation = RaceSimulation(max_time=max_time)
    else:
        sio.emit("start_error", "Invalid parameters", to=sid)
        return

    # Start the simulation
    eventlet.spawn(simulation.run)
    sio.emit("start_success", "Started session successfully", to=sid)


if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 8765)), app)

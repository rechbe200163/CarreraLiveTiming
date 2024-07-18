import logging
import errno
import select
import time
from flask import Flask, jsonify, render_template
from flask_socketio import SocketIO, emit
from carreralib import ControlUnit
import eventlet
import socketio

# Configure logging
logging.basicConfig(level=logging.DEBUG)

sio = socketio.Server(cors_allowed_origins='*')
app = socketio.WSGIApp(sio)


def posgetter(driver):
    return (-driver.laps, driver.time)


def formattime(time, longfmt=False):
    if time is None:
        return "n/a"
    s = time // 1000
    ms = time % 1000

    if not longfmt:
        return "%d.%03d" % (s, ms)
    elif s < 3600:
        return "%d:%02d.%03d" % (s // 60, s % 60, ms)
    else:
        return "%d:%02d:%02d.%03d" % (s // 3600, (s // 60) % 60, s % 60, ms)


class RMS(object):
    # CU reports zero fuel for all cars unless pit lane adapter is connected
    FUEL_MASK = ControlUnit.Status.PIT_LANE_MODE

    class Driver(object):
        def __init__(self, num):
            self.num = num
            self.time = None
            self.laptime = None
            self.bestlap = None
            self.laps = 0
            self.pits = 0
            self.fuel = 0
            self.pit = False
            self.has_fastest_lap = False

        def newlap(self, timer):
            if self.time is not None:
                self.laptime = timer.timestamp - self.time
                if self.bestlap is None or self.laptime < self.bestlap:
                    self.bestlap = self.laptime
                self.laps += 1
            self.time = timer.timestamp

    def __init__(self, cu, max_laps=None, max_time=None):
        self.max_laps = max_laps
        self.max_time = max_time
        self.cu = cu
        self.reset()

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

    def run(self):
        self.running = True
        last = None
        while self.running:
            try:
                data = self.cu.poll()
                if data == last:
                    continue
                elif isinstance(data, ControlUnit.Status):
                    self.handle_status(data)
                    sio.emit('update', self.update())
                    eventlet.sleep(0.5)  # Add delay between updates
                elif isinstance(data, ControlUnit.Timer):
                    self.handle_timer(data)
                    sio.emit('update', self.update())
                    eventlet.sleep(0.5)  # Add delay between updates
                else:
                    logging.warning("Unknown data from CU: " + str(data))
                last = data

                if self.max_time and (time.time() - self.start_time) >= self.max_time:
                    sio.emit("session_over", skip_sid=True)
                    self.stop()
                    return
            except IOError as e:
                if e.errno == errno.EAGAIN:
                    continue
                else:
                    raise


    def handle_status(self, status):
        for driver, fuel in zip(self.drivers, status.fuel):
            driver.fuel = round(fuel / 14.0 * 100.0, 1)
        for driver, pit in zip(self.drivers, status.pit):
            if pit and not driver.pit:
                driver.pits += 1
            driver.pit = pit
        self.status = status

    def handle_timer(self, timer):
        driver = self.drivers[timer.address]
        if driver.time is not None:
            driver.laptime = timer.timestamp - driver.time
            if driver.bestlap is None or driver.laptime < driver.bestlap:
                driver.bestlap = driver.laptime
        driver.time = timer.timestamp
        driver.laps += 1
        if self.maxlaps < driver.laps:
            self.maxlaps = driver.laps
            self.cu.setlap(self.maxlaps % 250)
        if self.start is None:
            self.start = timer.timestamp

        if self.max_laps and driver.laps >= self.max_laps:
            sio.emit("session_over", skip_sid=True)
            self.stop()
            return

    def update(self, blink=lambda: (time.time() * 2) % 2 == 0):
        valid_drivers = [driver for driver in self.drivers if driver.time]

        if valid_drivers:
            # Initialize fastest_lap to None
            fastest_lap = None

            # Ensure there are lap times before attempting to find the fastest lap
            lap_times = [driver.laptime for driver in self.drivers if driver.laptime]
            if lap_times:
                fastest_lap = min(lap_times)
                for driver in self.drivers:
                    driver.has_fastest_lap = driver.laptime == fastest_lap
            else:
                # No valid lap times yet
                for driver in self.drivers:
                    driver.has_fastest_lap = False

            sorted_drivers = sorted(valid_drivers, key=posgetter)

            # Convert sorted driver objects to dictionaries if needed
            sorted_drivers_dicts = [driver.__dict__ for driver in sorted_drivers]
            return sorted_drivers_dicts
        else:
            return []

            
    def stop(self):
        self.running = False
        self.reset()


race = None

# RMS-Instanz mit ControlUnit initialisieren
@sio.event
def connect(sid, environ):
    logging.info('Client connected: %s', sid)


@sio.event
def disconnect(sid):
    logging.info('Client disconnected: %s', sid)


@sio.event
def qualifing():
    ...


@sio.event
def stop(sid, data=None):
    global race
    if race:
        print("Stopping race simulation...")
        race.stop()
        sio.emit("stop_success", "Stopped session successfully", to=sid)
        race = None
        print(race)
    else:
        print("No active simulation to stop.")
        sio.emit("stop_error", "No active session to stop", to=sid)


@sio.event
def start(sid, data):
    global race
    print("Data", data)
    # data format: {'race_type': 'laps', 'max_laps': 1, 'max_time': None}
    race_type = data.get('race_type')
    max_laps = data.get('max_laps')
    max_time = data.get('max_time')

    if race:
        sio.emit("start_error", "A session is already running", to=sid)
        return

    if race_type == "laps" and max_laps is not None:
        race = RMS(cu= ControlUnit('D2:B9:57:15:EE:AC'),max_laps=max_laps)
    elif race_type == "time" and max_time is not None:
        race = RMS(cu=ControlUnit('D2:B9:57:15:EE:AC'),max_time=max_time)
    else:
        sio.emit("start_error", "Invalid parameters", to=sid)
        return

    # Start the simulation
    eventlet.spawn(race.run)
    sio.emit("start_success", "Started session successfully", to=sid)


if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 8765)), app)

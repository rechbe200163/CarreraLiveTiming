import errno
import time
import eventlet
import socketio
from flask import Flask, jsonify, render_template
from flask_socketio import SocketIO, emit
from carreralib import ControlUnit

# Configure logging
sio = socketio.Server(cors_allowed_origins='*')
app = socketio.WSGIApp(sio)

def posgetter(driver):
    return (-driver.laps, driver.time)

class RMS(object):
    # CU reports zero fuel for all cars unless pit lane adapter is connected
    FUEL_MASK = ControlUnit.Status.PIT_LANE_MODE

    class Driver(object):
        def __init__(self, num):
            self.num = num
            self.time = None
            self.laptime = None
            self.bestlap = None
            self.sector1 = None
            self.sector2 = None
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
        self.start_time = time.time()
        last = None
        print(f"in Run Method: {self.running}")
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
                    print(f"Update: {self.update()}")
                    eventlet.sleep(0.5)  # Add delay between updates
                else:
                    print(f"Unknown data from CU: {data}")
                last = data

                if self.max_time and (time.time() - self.start_time) >= self.max_time:
                    sio.emit("session_over", skip_sid=True)
                    eventlet.sleep(0.5)
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

    def handle_timer(self, timer: ControlUnit.Timer):
        driver = self.drivers[timer.address]

        if timer.sector == 1:
            if driver.time is not None:
                driver.laptime = timer.timestamp - driver.time
                driver.sector1 = driver.laptime - (driver.sector2 if driver.sector2 is not None else 0)
                print(f"Driver {driver.num} Sector 1: {driver.sector1}")

                if driver.bestlap is None or driver.laptime < driver.bestlap:
                    driver.bestlap = driver.laptime
                driver.newlap(timer)
                print(f"Driver {driver.num} Laptime: {driver.laptime}")

            driver.time = timer.timestamp
        
        elif timer.sector == 2:
            if driver.time is not None:
                driver.sector2 = timer.timestamp - driver.time
                print(f"Driver {driver.num} Sector 2: {driver.sector2}")

        # Update maximum laps
        if self.maxlaps < driver.laps:
            self.maxlaps = driver.laps
            self.cu.setlap(self.maxlaps % 250)
        
        if self.start is None:
            self.start = timer.timestamp


        # End race if maximum laps reached
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
            lap_times = [
                driver.laptime for driver in self.drivers if driver.laptime]
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
            sorted_drivers_dicts = [
                driver.__dict__ for driver in sorted_drivers]
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
    print('Client connected: %s', sid)


@sio.event
def disconnect(sid):
    print('Client disconnected: %s', sid)


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


def start_race():
    global race
    race = RMS(cu=ControlUnit('D2:B9:57:15:EE:AC'), max_laps=250)
    print("Starting")

    race.run()
    # Start the simulation


if __name__ == '__main__':
    start_race()
    eventlet.wsgi.server(eventlet.listen(('', 8765)), app)

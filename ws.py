import asyncio
import websockets
import json
import random
import time


async def simulate_race_data(websocket, path):
    while True:
        # Simulate race data
        data = {
            'timestamp': time.time(),
            'car_id': random.randint(1, 3),
            'speed': round(random.uniform(50, 200), 2),
            'position': random.randint(1, 3)
        }
        # Convert the data to JSON
        message = json.dumps(data)
        # Send the data to the client
        await websocket.send(message)
        # Wait for a second before sending the next data
        await asyncio.sleep(8)


async def main():
    async with websockets.serve(simulate_race_data, "localhost", 8765):
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())

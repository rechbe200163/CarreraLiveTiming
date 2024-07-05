from fastapi import FastAPI, WebSocket
from carreralib import ControlUnit
import asyncio

app = FastAPI()

# Carrera Digital Control Unit verbinden
cu = ControlUnit('1')


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Abrufen von Rundenzeiten (beispielhaft, anpassen an echte Anforderungen)
            lap_times = cu.poll()
            await websocket.send_json(lap_times)
            await asyncio.sleep(1)  # Daten alle 1 Sekunde senden
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await websocket.close()

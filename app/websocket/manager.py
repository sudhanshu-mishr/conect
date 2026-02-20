from collections import defaultdict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.active: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, room: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active[room].append(websocket)

    def disconnect(self, room: str, websocket: WebSocket) -> None:
        if websocket in self.active[room]:
            self.active[room].remove(websocket)

    async def broadcast(self, room: str, payload: dict) -> None:
        for conn in list(self.active[room]):
            await conn.send_json(payload)


manager = ConnectionManager()

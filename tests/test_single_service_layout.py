from pathlib import Path


def test_render_build_and_start_commands_present() -> None:
    data = Path("render.yaml").read_text()
    assert "pip install -r requirements.txt && cd frontend && npm install && npm run build && cd .." in data
    assert "uvicorn app.main:app --host 0.0.0.0 --port $PORT" in data


def test_frontend_build_targets_backend_static() -> None:
    data = Path("frontend/package.json").read_text()
    assert '"build": "vite build --outDir ../app/static"' in data


def test_main_mounts_static_and_spa_fallback() -> None:
    data = Path("app/main.py").read_text()
    assert 'app.mount("/", StaticFiles(directory="app/static", html=True), name="static")' in data
    assert "async def spa_fallback" in data


def test_api_and_ws_routes_are_under_api_prefix() -> None:
    chat_page = Path("frontend/src/pages/ChatPage.jsx").read_text()
    main_data = Path("app/main.py").read_text()
    ws_data = Path("app/api/ws.py").read_text()
    assert "/api/ws/chat/" in chat_page
    assert "app.include_router(ws.router, prefix=settings.api_prefix)" in main_data
    assert '@router.websocket("/chat/{match_id}")' in ws_data

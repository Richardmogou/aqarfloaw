# AqarFlow (MVP)

## Démarrage local
```bash
cp .env.example .env        # puis remplir (un .env de dev est fourni)
docker compose up -d db

# Backend
cd backend
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic revision --autogenerate -m "init" && alembic upgrade head
uvicorn app.main:app --reload          # http://localhost:8000/docs

# Frontend
cd ../frontend
npm install
npm run dev                            # http://localhost:3000
```
Vérification : `GET http://localhost:8000/api/v1/health` -> `{"status":"ok","database":"up"}`

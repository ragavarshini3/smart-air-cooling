# IoT-Enabled Smart Air-Cooling System

An enterprise-grade, software-only Smart Air-Cooling Management Platform built with React, FastAPI, MySQL, and Google Gemini AI.

## Features
- **Software Simulation Engine**: Realistic ambient temperature and humidity dynamics without physical IoT hardware.
- **Automated Fan Control**: Dynamic multi-stage fan speed calculation based on configurable thermal thresholds.
- **Real-Time Monitoring**: Interactive dashboard with key metrics, trend analysis, and online system status.
- **Automated Alerting**: Thermal safety alerts with smart deduplication and resolution workflow.
- **AI Cooling Assistant**: Database-grounded conversational insights powered by Google Gemini API.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons, Axios, React Router.
- **Backend**: Python 3.12+, FastAPI, SQLAlchemy, PyMySQL, Pydantic v2, Uvicorn.
- **Database**: MySQL.
- **AI**: Google Gemini API (`google-genai`).

## Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Docker Setup
```bash
docker-compose up --build
```

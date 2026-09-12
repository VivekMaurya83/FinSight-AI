# FinSight AI — Production Fintech Education Chatbot

FinSight AI is a production-structured, modular, and observable financial education chatbot web application. Designed specifically as a **testing and evaluation platform for Aegis AI**, FinSight AI provides a controlled conversational environment bounded strictly to six foundational financial literacy areas with zero tolerance for out-of-scope advice, hallucinations, or regulatory overreach.

> [!IMPORTANT]
> **Python Virtual Environment Isolation:**
> Python dependencies are installed only inside `backend/venv/`. Global pip installations are not used.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Supported Chatbot Scope](#2-supported-chatbot-scope)
3. [Strictly Out-of-Scope Topics](#3-strictly-out-of-scope-topics)
4. [Architecture](#4-architecture)
5. [Tech Stack](#5-tech-stack)
6. [Folder Structure](#6-folder-structure)
7. [Python Virtual Environment Setup](#7-python-virtual-environment-setup)
8. [PostgreSQL Setup](#8-postgresql-setup)
9. [Ollama LLM Setup](#9-ollama-llm-setup)
10. [Environment Variables](#10-environment-variables)
11. [Alembic Database Migrations](#11-alembic-database-migrations)
12. [Backend Startup](#12-backend-startup)
13. [Frontend Startup](#13-frontend-startup)
14. [Docker Setup](#14-docker-setup)
15. [API Endpoints Reference](#15-api-endpoints-reference)
16. [Automated & Manual Testing](#16-automated--manual-testing)
17. [Security Implementation](#17-security-implementation)
18. [Aegis AI Integration Architecture](#18-aegis-ai-integration-architecture)
19. [Deployment Options](#19-deployment-options)
20. [Known Limitations](#20-known-limitations)

---

## 1. Project Overview

FinSight AI is built to educate users on personal financial literacy while acting as a deterministic testbed for Aegis AI. Unlike general-purpose chatbots, FinSight AI enforces deterministic boundaries around financial advice, logs end-to-end inference telemetry into PostgreSQL, and allows researchers and engineers to test model guardrails, latency, and adversarial refusal behavior.

---

## 2. Supported Chatbot Scope

FinSight AI **ONLY** answers queries in the following six financial educational areas:

1. **Personal Budgeting**
   - Monthly budgeting principles
   - The 50/30/20 budgeting rule
   - Income vs. expenses analysis
   - Fixed vs. variable expense distinctions
   - Expense categorization and cash flow planning
2. **Savings & Emergency Funds**
   - Emergency reserve sizing (e.g., 3-6 months)
   - High-yield liquid savings strategies
   - Compounding interest timelines
   - Short-term vs. long-term savings goals
3. **Basic Investing Education**
   - Systematic Investment Plans (SIP) concepts
   - Mutual funds and index funds fundamentals
   - Asset allocation and risk tolerance
   - Diversification and market risk concepts
   - Investment terminology
4. **Loans & EMIs**
   - Principal, interest rate, and tenure
   - Equated Monthly Installment (EMI) mathematical formulas
   - Reducing balance vs. flat interest calculations
   - Amortization and repayment strategies
5. **Credit Scores**
   - Credit score ranges (FICO / CIBIL)
   - Credit utilization ratio management
   - Payment history impact and inquiry factors
   - Responsible credit card habits
6. **Financial Terminology**
   - APR vs. APY
   - Inflation & purchasing power
   - Liquidity and net worth
   - Compounding, assets, and liabilities

---

## 3. Strictly Out-of-Scope Topics

The chatbot **MUST NOT** provide specialized advice or functionality for:

- Tax filing, returns, audits, or tax optimization
- Insurance policy recommendations or selection
- Stock picking, day trading, or ticker-specific advice
- Buy / Sell / Hold recommendations
- Options, futures, forex, or margin trading
- Cryptocurrencies, tokens, NFTs, or blockchain speculation
- Actual banking transactions, wire transfers, or payment processing
- Connecting bank accounts via credentials or Plaid
- Credit card or loan applications
- Legal advice or dispute representation
- Personalized, regulated financial advisory

### Standard Refusal Response
When an out-of-scope query is detected, FinSight AI responds with:

> *"This topic is outside FinSight AI's current scope. I can help with budgeting, savings, basic investing concepts, loans & EMIs, credit scores, or financial terminology."*

---

## 4. Architecture

```
Frontend (React + Vite)
   │ (JWT Auth Header, JSON)
   ▼
FastAPI Application Layer (backend/venv)
   │
   ├── 1. Rate Limiting Middleware (20 req/min)
   ├── 2. Scope Validator (Deterministic & Keyword Whitelisting)
   ├── 3. Conversation & Message Repositories (PostgreSQL)
   ├── 4. AI Gateway (Provider Abstraction Layer)
   │        │
   │        ├── Ollama Provider ──► Ollama Daemon (HTTP API :11434)
   │        └── [Future Aegis Provider]
   │
   └── 5. AI Observability Layer ──► ai_interactions Table (PostgreSQL)
```

---

## 5. Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, React Markdown (remark-gfm), React Router DOM, Axios
- **Backend**: Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.0 (Async), Alembic, Asyncpg, Python-Jose (JWT), Bcrypt, HTTPX
- **Database**: PostgreSQL 16+
- **Inference Engine**: Ollama (HTTP API on port 11434; default model `llama3.2` with dynamic local fallback)
- **Containerization**: Docker & Docker Compose

---

## 6. Folder Structure

```
Fintech AI/
├── backend/
│   ├── venv/                       # Project-local Python Virtual Environment (ignored in git)
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py             # JWT auth & current user dependencies
│   │   │   └── endpoints/          # Auth, Conversations, Messages, Health
│   │   ├── core/
│   │   │   ├── config.py           # Pydantic BaseSettings (.env loader)
│   │   │   ├── database.py         # Async SQLAlchemy engine & sessionmaker
│   │   │   ├── security.py         # Bcrypt hashing & JWT creation/verification
│   │   │   └── rate_limiter.py     # Sliding-window rate limiter
│   │   ├── models/                 # User, Conversation, Message, AIInteraction
│   │   ├── schemas/                # Pydantic validation schemas
│   │   ├── repositories/           # Database CRUD abstractions
│   │   ├── services/
│   │   │   ├── ai_gateway.py       # Extensible AI provider abstraction
│   │   │   ├── ollama_service.py   # HTTP client to local Ollama
│   │   │   ├── ai_observability.py # Telemetry & secret redaction
│   │   │   └── scope_validator.py  # Guardrail enforcement & refusal logic
│   │   └── main.py                 # FastAPI application factory
│   ├── alembic/                    # Database migrations
│   ├── tests/                      # Pytest automated test suite
│   ├── requirements.txt            # Pinned backend dependencies
│   ├── Dockerfile                  # Backend production container
│   ├── .env.example                # Configuration template
│   └── .env                        # Local environment configuration
├── frontend/
│   ├── src/
│   │   ├── components/             # Sidebar, ChatHeader, ChatInput, MessageBubble, etc.
│   │   ├── context/                # AuthContext, ChatContext
│   │   ├── pages/                  # LandingPage, LoginPage, SignupPage, DashboardPage, ChatPage
│   │   ├── services/               # API, AuthService, ChatService, HealthService
│   │   ├── App.jsx                 # Routes & protected route guards
│   │   ├── main.jsx                # React root entrypoint
│   │   └── index.css               # Tailwind CSS tokens & typography
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── docs/
│   └── architecture.md             # Detailed architecture & Aegis AI evaluation specs
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 7. Python Virtual Environment Setup

All backend dependencies must be installed into a project-local virtual environment located at `backend/venv/`.

### Windows:
```powershell
cd backend
python -m venv venv
# or using specific python launcher:
py -3.11 -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

### Linux / macOS:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 8. PostgreSQL Setup

Ensure PostgreSQL is running locally on port 5432.

```powershell
# Create the database using psql:
psql -U postgres -c "CREATE DATABASE finsight;"
```

Verify your connection string in `backend/.env`:
```env
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/finsight
```

---

## 9. Ollama LLM Setup

FinSight AI communicates with Ollama via its HTTP API (`http://localhost:11434`).

1. Download and install Ollama from [ollama.com](https://ollama.com).
2. Start the Ollama daemon:
   ```bash
   ollama serve
   ```
3. Pull the default model:
   ```bash
   ollama pull llama3.2
   ```
4. Verify installed models:
   ```bash
   ollama list
   ```

*Note: If `llama3.2` is still downloading or unavailable, FinSight AI automatically falls back to any installed local model (such as `qwen2:7b` or `mistral:latest`), ensuring seamless local testing.*

---

## 10. Environment Variables

Create `backend/.env` using `backend/.env.example` as a template:

```env
# Database Connection
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/finsight

# JWT Authentication
JWT_SECRET_KEY=finsight_ai_super_secret_jwt_key_2026_aegis_testing_suite
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Ollama LLM Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# CORS & Frontend Origin
FRONTEND_URL=http://localhost:5173

# Rate Limiting (Requests per minute per user)
CHAT_RATE_LIMIT=20
```

---

## 11. Alembic Database Migrations

Apply database schema migrations to create `users`, `conversations`, `messages`, and `ai_interactions` tables:

```powershell
cd backend
# Activate venv
venv\Scripts\activate   # (Windows)
# or: source venv/bin/activate (Linux/macOS)

alembic upgrade head
```

---

## 12. Backend Startup

With the virtual environment activated:

```powershell
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

- API Base: `http://localhost:8000`
- Interactive Swagger Docs: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/api/health`

---

## 13. Frontend Startup

Inside the `frontend/` directory:

```bash
cd frontend
npm install
npm run dev
```

- Local Web Application: `http://localhost:5173`

---

## 14. Docker Setup

To spin up all services (Frontend, Backend, PostgreSQL, and Ollama) using Docker Compose:

```bash
docker-compose up -d --build
```

Access:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`
- Ollama: `localhost:11434`

To stop:
```bash
docker-compose down
```

---

## 15. API Endpoints Reference

### Authentication
- `POST /api/auth/signup`: Register new account (Full Name, Email, Password, Confirm Password).
- `POST /api/auth/login`: Authenticate and receive JWT access token.
- `GET /api/auth/me`: Retrieve current user profile (requires Bearer token).

### Conversations
- `POST /api/conversations`: Create a new conversation session.
- `GET /api/conversations`: List all conversations for the authenticated user.
- `GET /api/conversations/{conversation_id}`: Retrieve conversation details & message history.
- `DELETE /api/conversations/{conversation_id}`: Delete a conversation (ownership validated).

### Messages
- `POST /api/conversations/{conversation_id}/messages`: Submit user prompt, run scope validator, query Ollama via AI Gateway, record observability telemetry, and return response.
- `GET /api/conversations/{conversation_id}/messages`: Retrieve conversation messages.

### Health
- `GET /api/health`: Overall system health status.
- `GET /api/health/database`: PostgreSQL connection test.
- `GET /api/health/ollama`: Ollama daemon status & active/available models.

---

## 16. Automated & Manual Testing

Run the full pytest suite inside the backend virtual environment:

```powershell
cd backend
venv\Scripts\activate
pytest -v
```

### Verified Test Scenarios:
1. **Authentication**: User signup, password mismatch rejection, duplicate email prevention, password verification, JWT expiration.
2. **Authorization & Ownership**: Protected endpoint enforcement, isolation between user conversations (User B cannot access or delete User A's chat).
3. **Conversations & Messages**: Conversation lifecycle, auto-title generation from the initial prompt without redundant LLM calls.
4. **Scope Validator**: Passages across all 6 supported domains; deterministic refusals for stocks, crypto, forex, taxes, and transactions.
5. **AI Observability**: Sanitization and redaction of secrets (passwords, JWTs, card numbers, PINs) and persistence of `ai_interactions`.
6. **Ollama Resilience**: Graceful error handling and offline health response without crashing FastAPI.

---

## 17. Security Implementation

- **Password Protection**: Passwords hashed with bcrypt (cost factor 12).
- **Session Tokens**: JWT with HS256 and configurable expiration.
- **Strict Data Ownership**: Users can only access and manipulate their own conversations and messages.
- **Rate Limiting**: Sliding window limiter capped at `CHAT_RATE_LIMIT=20` requests per minute.
- **Safe Error Responses**: Global exception handlers prevent backend stack traces from leaking to clients.
- **Observability Sanitization**: Automatic regex-based redaction of passwords, tokens, and credit card numbers prior to logging.

---

## 18. Aegis AI Integration Architecture

FinSight AI is built to evaluate trust, safety, and guardrail efficacy for **Aegis AI**:

1. **AI Gateway (`AIGateway`)**: Provides a unified dispatch point. Replacing or wrapping `OllamaProvider` with an `AegisProvider` requires zero changes to frontend or API routes.
2. **Telemetry Table (`ai_interactions`)**: Logs `request_id`, user, model, prompt, response, latency in ms, status (`success` vs `out_of_scope`), and error messages for red-team analysis.
3. **Evaluation Scenarios**: Test jailbreak resistance, hallucination rates on financial formulas, and prompt injection resilience.

---

## 19. Deployment Options

1. **Local Virtual Environment (Primary Development Workflow)**: Fast, native local execution with Python venv and Node.
2. **Hybrid Deployment**: Local FastAPI backend communicating with a remote/cloud Ollama server (e.g. `OLLAMA_BASE_URL=https://ollama.internal.company.com`).
3. **Full Docker Compose**: Unified single-command deployment for containerized test runners.

---

## 20. Known Limitations

- **Model Compute Requirements**: Running 7B+ models on Ollama requires sufficient GPU VRAM or modern multi-core CPU.
- **Scope Restriction**: FinSight AI strictly rejects queries regarding tax optimization, stock trading, or insurance by design; it is not a general-purpose financial assistant.
- **Educational Disclaimer**: All responses are for educational literacy and must not be construed as regulated financial advice.

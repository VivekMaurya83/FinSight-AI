# FinSight AI — Architecture & Aegis AI Testing Specification

FinSight AI is a production-structured fintech educational chatbot web application designed specifically to serve as an observable, controlled, and modular **Testing & Evaluation Environment for Aegis AI**.

---

## 1. System Overview

FinSight AI addresses the critical problem of domain containment in financial conversational AI. It restricts interaction exclusively to six foundational financial education domains while deterministically refusing out-of-scope queries (such as stock picking, trading strategies, cryptocurrency, tax filing, and transactions).

### Architecture Principles

1. **Strict Scope Whitelisting**: Out-of-scope financial advice is intercepted before or at inference to ensure zero regulatory non-compliance.
2. **AI Provider Abstraction**: The AI Gateway decouples the chat application from the underlying model provider (Ollama today, Aegis AI proxy in future phases).
3. **Comprehensive Observability**: Every AI interaction records a unique `request_id`, model name, prompt, output, latency, status, and error state in the `ai_interactions` table.
4. **Data Privacy & Redaction**: Sensitive information (passwords, JWT tokens, account numbers, PINs, CVVs) is automatically redacted before persistence.

---

## 2. High-Level Component Diagram

```mermaid
graph TD
    subgraph Client ["Frontend Client (React + Vite)"]
        Landing["Landing Page / Auth"]
        Dashboard["Fintech Dashboard"]
        Chat["Chatbot Interface"]
    end

    subgraph API ["FastAPI Backend (backend/venv)"]
        Router["API Routers (/auth, /conversations, /messages, /health)"]
        JWT["JWT Auth & Rate Limiter (20 req/min)"]
        ScopeGuard["Scope Validator (6 Core Domains Whitelist)"]
        Gateway["AI Gateway Abstraction Layer"]
        Obs["AI Observability Service"]
    end

    subgraph Storage ["Persistent Storage"]
        PG[("PostgreSQL Database (finsight)")]
        Tables["users | conversations | messages | ai_interactions"]
    end

    subgraph LLM ["Inference Provider"]
        OllamaLocal["Ollama Local Daemon (:11434)"]
        Model["llama3.2 / Fallback Active Model"]
    end

    Client -->|HTTP/REST| Router
    Router --> JWT
    JWT --> ScopeGuard
    ScopeGuard -->|If In-Scope| Gateway
    ScopeGuard -->|If Out-of-Scope| Obs
    Gateway --> Obs
    Gateway --> OllamaLocal
    OllamaLocal --> Model
    Obs -->|Telemetry Logs| PG
    Router -->|User & Chat Data| PG
```

---

## 3. Aegis AI Integration Architecture

FinSight AI serves as the target under test for Aegis AI red-teaming, trust, and safety evaluations.

```mermaid
sequenceDiagram
    autonumber
    actor User as Tester / User
    participant Frontend as FinSight Frontend
    participant API as FastAPI Backend
    participant Guard as Scope Validator
    participant Gateway as AI Gateway
    participant Ollama as Ollama Daemon
    participant Obs as Observability Layer
    participant DB as PostgreSQL (ai_interactions)

    User->>Frontend: Send financial question
    Frontend->>API: POST /api/conversations/{id}/messages
    API->>API: Validate JWT & Rate Limit
    API->>Guard: Validate query domain

    alt Query is Out of Scope (e.g. "Buy Apple stock")
        Guard-->>API: Reject with mandated refusal
        API->>Obs: Record out_of_scope telemetry
        Obs->>DB: INSERT ai_interactions (status="out_of_scope")
        API-->>Frontend: Return standard refusal response
    else Query is In Scope (e.g. "What is 50/30/20 budget?")
        API->>Gateway: Dispatch prompt + history
        Gateway->>Ollama: POST /api/chat with System Prompt
        Ollama-->>Gateway: Return educational explanation
        Gateway->>Obs: Measure latency & status
        Obs->>DB: INSERT ai_interactions (status="success", latency_ms)
        API-->>Frontend: Return assistant response
    end
```

### Clean Provider Abstraction (`AIProvider`)

In `backend/app/services/ai_gateway.py`:

```python
class AIProvider(abc.ABC):
    @abc.abstractmethod
    async def generate_response(self, messages, override_model=None):
        pass

    @abc.abstractmethod
    async def get_active_model(self):
        pass
```

- **Current Concrete Provider**: `OllamaProvider`
- **Future Aegis Provider**: Simply implement `AegisProvider(AIProvider)` connecting to the Aegis AI red-teaming proxy without altering application endpoints or database schema.

---

## 4. Observability Pipeline & Threat Telemetry

The `ai_interactions` table enables Aegis AI to measure model drift, safety violations, jailbreak attempts, and refusal accuracy:

| Column | Type | Purpose |
| :--- | :--- | :--- |
| `id` | UUID / String | Unique record primary key |
| `request_id` | String | Correlated trace ID (`req_<hex>`) |
| `user_id` | UUID (FK) | Identity of caller |
| `conversation_id` | UUID (FK) | Session grouping |
| `model` | String | Model utilized (e.g. `llama3.2`) |
| `input_text` | Text | Sanitized user prompt |
| `output_text` | Text | Model or guardrail output |
| `latency_ms` | Float | Millisecond response latency |
| `status` | String | `success`, `out_of_scope`, `error` |
| `error_message` | Text | Technical diagnostics |
| `created_at` | Timestamp | Telemetry timestamp |

---

## 5. Scope Specification

### The 6 Whitelisted Domains
1. **Personal Budgeting**: 50/30/20 framework, income vs expenses, fixed vs variable costs, categorization.
2. **Savings & Emergency Funds**: Emergency fund sizing, compound interest, short vs long term goals.
3. **Basic Investing Education**: SIP concepts, mutual funds, asset allocation, diversification, market risk.
4. **Loans & EMIs**: Principal, interest rates, loan tenure, reducing vs flat rate, EMI formula.
5. **Credit Scores**: FICO/CIBIL basics, credit utilization ratio, payment history factors.
6. **Financial Terminology**: APR, APY, Net Worth, Liquidity, Inflation, Compounding, Diversification.

### Mandatory Refusal Verbatim Text
```
This topic is outside FinSight AI's current scope. I can help with budgeting, savings, basic investing concepts, loans & EMIs, credit scores, or financial terminology.
```

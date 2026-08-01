# Phase 9: AI Intelligence Engine — API Setup Guide

ThreatLens AI has been upgraded with an enterprise-grade AI Intelligence Engine. It uses **Groq** for high-speed, LLM-powered analysis and **Tavily** for real-time threat intelligence search.

> [!IMPORTANT]
> The AI features require API keys to function. Without these keys, ThreatLens AI will gracefully fall back to its deterministic investigation engine and continue working normally.

Both services provide **generous free tiers** that are more than sufficient for normal use.

---

## 1. Groq LLM Setup

Groq provides access to Meta's LLaMA 3.3 70B model at incredibly high speeds.

**Free Tier Limits:**
- ~14,400 requests per day
- 6,000 tokens per minute

### How to get a Groq API Key:
1. Go to the [GroqCloud Console](https://console.groq.com/keys)
2. Create a free account or log in.
3. Navigate to **API Keys** in the sidebar.
4. Click **Create API Key**.
5. Copy the generated key (it starts with `gsk_`).

### Setup:
Add the key to your `backend/.env` file:
```env
GROQ_API_KEY=gsk_your_key_here
```

---

## 2. Tavily Threat Intelligence Setup

Tavily is an AI-powered search API optimized for research and intelligence gathering. ThreatLens AI uses it to look up domains, IPs, and emails in real-time to find recent threat actor campaigns.

**Free Tier Limits:**
- 1,000 free searches per month

### How to get a Tavily API Key:
1. Go to the [Tavily Developer Portal](https://app.tavily.com/sign-in)
2. Create a free account or log in.
3. Your API key will be displayed on the dashboard (it starts with `tvly-`).

### Setup:
Add the key to your `backend/.env` file:
```env
TAVILY_API_KEY=tvly-your_key_here
```

---

## 3. Configuration & Verification

### Advanced AI Settings (`backend/.env`)
You can tweak how the AI engine behaves using these environment variables:

```env
AI_PROVIDER=groq                       # Currently only groq is supported
AI_MODEL=llama-3.3-70b-versatile       # The recommended model
AI_TIMEOUT=30                           # How long to wait for an AI response (seconds)
AI_MAX_RETRIES=3                        # How many times to retry on failure
AI_CACHE_TTL=3600                       # How long to cache AI responses (1 hour)
AI_ENABLED=true                         # Set to false to disable all AI features globally
```

### Verification
Once your keys are set up, start both the frontend and backend servers.
Go to the **Settings** page (or use the API endpoint `/api/v1/ai/status`) to verify that your keys are recognized and the services are healthy.

If an API key is invalid or rate-limited, the system will seamlessly fallback to deterministic mode, and you will see "AI Analysis Unavailable" in the investigation reports.

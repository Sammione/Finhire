# FinHireIQ: AI-Powered Recruitment Intelligence Platform

FinHireIQ is an enterprise-grade recruitment platform designed for financial loan companies. It uses AI to discover, rank, and verify professional talent.

## Key Features
- **AI Profile Parsing**: Extract data from LinkedIn/CVs using GPT-4.
- **Semantic Search**: Search candidates by intent and skills, not just keywords.
- **Intelligence Scoring**: AI-driven stability and fintech relevance metrics.
- **Recruiter Dashboard**: Manage candidate pipelines and automated outreach.
- **Mobile App**: Recruiting on the go for agile talent acquisition teams.

## Tech Stack
- **Backend**: FastAPI, PostgreSQL, Redis, Elasticsearch.
- **Frontend**: Next.js, TailwindCSS.
- **Mobile**: Flutter.
- **AI**: OpenAI, Sentence Transformers, LangChain.
- **Infrastructure**: Docker, AWS.

## Getting Started

### Prerequisites
- Docker & Docker Compose
- OpenAI API Key

### Running the Backend
```bash
docker-compose up --build
```

### Running the Dashboard
```bash
cd dashboard
npm install
npm run dev
```

### Running the Mobile App
```bash
cd mobile
flutter pub get
flutter run
```

## API Documentation
Once the backend is running, visit: `http://localhost:8000/docs` for the interactive Swagger documentation.

## Security & Ethics
FinHireIQ implements RBAC, encrypted storage, and ethical AI scoring to avoid bias and ensure compliance with privacy laws.

# WorkflowAI Backend

A powerful backend for the WorkflowAI platform built with FastAPI, MongoDB, LangChain, and LangGraph.

## Features

- **FastAPI**: Modern, fast web framework for building APIs
- **MongoDB**: Document database for storing workflows, users, and executions
- **LangChain**: Framework for developing applications with language models
- **LangGraph**: Library for building stateful, multi-actor applications with LLMs
- **JWT Authentication**: Secure user authentication and authorization
- **Real-time Execution**: WebSocket support for real-time workflow execution updates
- **Custom Nodes**: Support for user-defined Python code nodes
- **AI Integration**: OpenAI GPT models for chatbot and AI processing nodes

## Installation

1. Install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start MongoDB (if running locally):
```bash
mongod
```

4. Run the server:
```bash
python run.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── core/
│   │   ├── config.py        # Configuration settings
│   │   └── security.py      # Authentication utilities
│   ├── models/              # Pydantic models
│   │   ├── user.py
│   │   ├── workflow.py
│   │   └── execution.py
│   ├── routers/             # API route handlers
│   │   ├── auth.py
│   │   ├── workflows.py
│   │   ├── nodes.py
│   │   └── execution.py
│   ├── services/            # Business logic
│   │   ├── node_service.py
│   │   ├── execution_service.py
│   │   └── langchain_service.py
│   └── database.py          # Database connection
├── requirements.txt
├── .env.example
├── run.py
└── README.md
```

## Environment Variables

- `MONGODB_URL`: MongoDB connection string
- `DATABASE_NAME`: Database name
- `JWT_SECRET_KEY`: Secret key for JWT tokens
- `OPENAI_API_KEY`: OpenAI API key for AI features

## Usage

### Authentication

1. Register a new user:
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "password123"}'
```

2. Login:
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'
```

### Workflows

Create, update, and execute workflows through the API endpoints.

### Custom Nodes

Users can create custom nodes with Python code that will be executed as part of workflows.

## Development

The backend is designed to be modular and extensible. Key components:

- **Models**: Define data structures using Pydantic
- **Routers**: Handle HTTP requests and responses
- **Services**: Contain business logic and integrations
- **Database**: MongoDB operations and connection management

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with Pydantic
- CORS configuration for frontend integration
from fastapi import FastAPI
from app.routes import auth, workflow

app = FastAPI()
app.include_router(auth.router)
app.include_router(workflow.router)

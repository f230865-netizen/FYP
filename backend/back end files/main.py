from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, users, upload
from routers.dashboard import router as dashboard_router
from routers.users import router as users_router

app = FastAPI(title="Dr. Data API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "null"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(upload.router)
app.include_router(dashboard_router)

@app.get("/")
def root():
    return {"message": "Dr. Data API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}

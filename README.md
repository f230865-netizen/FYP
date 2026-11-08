# Dr. Data

AI-powered multimodal data cleaning platform (FYP).

## Backend setup

Ubuntu only: sudo apt install libmagic1 postgresql

    cd backend
    python3 -m venv venv
    source venv/bin/activate        (Windows: venv\Scripts\activate)
    pip install -r requirements.txt
    cp .env.example .env            (Windows: copy .env.example .env)

Edit .env with your own PostgreSQL password. Create a database named
datacleaner, then:

    python3 create_tables.py
    uvicorn main:app --reload

API docs: http://localhost:8000/docs

Warning: recreate_tables.py DROPS all tables. Dev use only.

## Frontend setup

    cd frontend
    npm install
    npm run dev

App: http://localhost:5173

HTML design screens are in frontend/prototype/ (open DrData_Landing.html).

## Folders

- backend/routers   API routes (auth, users, upload)
- backend/services  business logic
- frontend/src      React app
- docs/             project documentation

- Final Year Project of BS CS

# Démarrage rapide Windows

## Backend

```bat
cd backend
C:\Users\mailer\new-project\venv\Scripts\python.exe -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py seed_demo
python manage.py createsuperuser
python manage.py runserver
```

API : http://127.0.0.1:8000/api/products/  
Django Admin : http://127.0.0.1:8000/admin/

## Frontend

Dans un autre terminal :

```bat
cd frontend
npm install
npm run dev
```

Frontend : http://localhost:5173

## Admin React

Clique sur **Admin Dashboard** et connecte-toi avec le même compte créé par `createsuperuser`.

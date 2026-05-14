# DevOps E-commerce Mini Project

![CI](https://github.com/USERNAME/devops-ecommerce/actions/workflows/ci.yml/badge.svg)

Projet DevOps : **site e-commerce simplifié** avec Django REST Framework, React, MySQL, Docker et GitHub Actions.

## Fonctionnalités

Version Pro : dashboard admin avec sidebar, upload images, filtres, détails produit et gestion statut commande.


- Catalogue de produits
- Panier côté client
- Simulation de commande sans paiement réel
- Tableau de bord administrateur React professionnel
- Login admin avec les mêmes identifiants que Django Admin
- Ajout, modification et suppression des produits
- Gestion des catégories
- Gestion du stock
- Upload d'images produit
- Recherche et filtrage produits
- Modification du statut des commandes
- Détails produit en modal
- API REST documentée par routes
- Tests automatisés backend
- Dockerfile backend + frontend
- Docker Compose pour lancer toute la stack
- Pipeline CI/CD GitHub Actions

## Stack technique

- Backend : Django + Django REST Framework
- Frontend : React + Vite
- Base de données : MySQL 8
- Conteneurisation : Docker + Docker Compose
- CI/CD : GitHub Actions
- Registry : Docker Hub ou GitHub Container Registry

## Structure

```text
devops-ecommerce/
├── backend/
├── frontend/
├── docker-compose.yml
├── .github/workflows/ci.yml
├── rapport/
├── screenshots/
└── README.md
```

## Lancer en local sans Docker

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py createsuperuser
python manage.py runserver
```

Backend : http://127.0.0.1:8000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend : http://localhost:5173

## Lancer avec Docker

```bash
docker compose up --build
```

- Frontend : http://localhost:5173
- Backend : http://localhost:8000
- Django Admin : http://localhost:8000/admin

## Compte admin

Créer un compte admin :

```bash
docker compose exec backend python manage.py createsuperuser
```

Ou sans Docker :

```bash
cd backend
python manage.py createsuperuser
```

Le dashboard React utilise le même login que Django Admin.

## Routes API

```text
GET    /api/products/
POST   /api/products/
GET    /api/products/<id>/
PUT    /api/products/<id>/
DELETE /api/products/<id>/

GET    /api/categories/
POST   /api/categories/

POST   /api/orders/
GET    /api/orders/

POST   /api/auth/admin-login/
```

## Tests

```bash
cd backend
python manage.py test
```

## CI/CD

Le pipeline GitHub Actions exécute :

1. Installation des dépendances backend
2. Tests Django
3. Installation des dépendances frontend
4. Build React
5. Build Docker images

La publication automatique de l'image Docker peut être activée avec les secrets :

```text
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
```

## Workflow Git conseillé

```text
main        : branche production
develop     : branche intégration
feature/*   : branches de fonctionnalités
```

Exemples de commits :

```text
feat: add product api
feat: add react admin dashboard
chore: add docker compose
test: add order tests
docs: update README
```

## Répartition du travail

Étudiant 1 :
- Backend Django
- API REST
- Frontend React
- Docker
- CI/CD

Étudiant 2 :
- README
- Captures d'écran
- Tests simples
- Rapport
- Relecture Pull Requests

## Auteurs

- Nom Étudiant 1
- Nom Étudiant 2


## Version Store/Admin séparés

- Store disponible sur `http://localhost:5173/`.
- Admin dashboard disponible sur `http://localhost:5173/admin`.
- Le panier s’ouvre dans une fenêtre latérale professionnelle.
- Le checkout s’ouvre dans une fenêtre modale.


## Améliorations v3

- Homepage plus complète : hero, catégories, section avantages et footer.
- Panier persistant avec localStorage.
- Fenêtre de succès après commande avec numéro de commande.
- Détails de commande dans le dashboard administrateur.
- Impression de facture depuis le dashboard admin.


## Version v4 Admin UX

Les formulaires d'ajout catégorie/produit ne sont plus affichés directement. Ils s'ouvrent dans des fenêtres modales après clic sur les boutons `+ Add Category` ou `+ Add Product`, pour une interface admin plus propre et professionnelle.


## Version v5 Toast UX

Les messages de succès/erreur sont maintenant affichés dans une fenêtre toast centrée avec icône et animation, au lieu d’un simple bandeau en haut de page.


## Final v5 checkout fix

Cette version garde l'interface simple sans product landing page. Le problème de focus dans le formulaire checkout est corrigé : l'utilisateur peut écrire dans les champs sans devoir cliquer à nouveau après chaque caractère.

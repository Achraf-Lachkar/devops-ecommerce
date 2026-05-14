# Rapport DevOps — Site e-commerce simplifié

## Page de garde

Établissement : [Nom de l’établissement]  
Module : DevOps  
Projet : Site e-commerce simplifié avec CI/CD  
Étudiants : [Nom 1] et [Nom 2]  
Année universitaire : 2025-2026  

## 1. Introduction

Ce mini-projet consiste à développer une application e-commerce simplifiée et à mettre en place une chaîne DevOps complète autour du projet. L’application permet de consulter un catalogue de produits, d’ajouter des produits au panier et de simuler une commande sans paiement réel. Une interface administrateur permet de gérer les produits, les catégories et les commandes.

## 2. Objectifs

- Développer une application web complète.
- Versionner le projet avec Git.
- Utiliser un workflow basé sur les branches.
- Conteneuriser le projet avec Docker.
- Automatiser les tests et le build avec GitHub Actions.
- Documenter l’architecture et les étapes de déploiement.

## 3. Architecture de l’application

L’architecture est divisée en trois parties :

- Frontend : React + Vite.
- Backend : Django REST Framework.
- Base de données : MySQL.

Schéma :

```text
Client Browser
     |
     v
React Frontend
     |
     v
Django REST API
     |
     v
MySQL Database
```

## 4. Choix techniques

Django REST Framework a été choisi pour créer rapidement une API REST claire et maintenable. React a été utilisé pour construire une interface moderne. MySQL a été choisi comme système de gestion de base de données relationnelle. Docker Compose permet de lancer toute la stack avec une seule commande.

## 5. Fonctionnalités réalisées

### Côté client

- Affichage du catalogue produits.
- Ajout au panier.
- Simulation de commande.
- Mise à jour du stock après commande.

### Côté administrateur

- Login administrateur avec le même compte que Django Admin.
- Ajout de catégories.
- Ajout de produits.
- Modification des produits.
- Suppression des produits.
- Consultation des commandes.

## 6. Structure du code

```text
backend/
  config/
  products/
  orders/
  users/

frontend/
  src/
  public/

.github/
  workflows/
```

## 7. Modèle de données

Les principaux modèles sont :

- Category : catégorie de produit.
- Product : produit avec prix, stock, description et statut.
- Order : commande client.
- OrderItem : ligne de commande.

## 8. Stratégie Git

Le workflow adopté est :

- main : branche de production.
- develop : branche d’intégration.
- feature/* : branches de fonctionnalités.

Exemples de branches :

- feature/backend-api
- feature/react-frontend
- feature/docker
- feature/ci-cd
- feature/documentation

Les commits utilisent des messages explicites inspirés de Conventional Commits.

## 9. Conteneurisation Docker

Le projet contient :

- Un Dockerfile backend.
- Un Dockerfile frontend.
- Un fichier docker-compose.yml.

Commande de lancement :

```bash
docker compose up --build
```

## 10. Pipeline CI/CD

Le pipeline GitHub Actions contient les étapes suivantes :

1. Installation des dépendances backend.
2. Exécution des tests Django.
3. Installation des dépendances frontend.
4. Build React.
5. Build des images Docker.

Le pipeline est déclenché à chaque push ou pull request sur main et develop.

## 11. Tests

Les tests couvrent :

- La récupération des produits.
- La création de produits par un admin.
- La création de commande.
- Le login admin.

Commande :

```bash
python manage.py test
```

## 12. Difficultés rencontrées

- Configuration de MySQL avec Docker.
- Gestion de l’authentification du dashboard admin.
- Connexion entre React et Django API.
- Organisation du workflow Git.

## 13. Solutions apportées

- Utilisation de Docker Compose pour standardiser l’environnement.
- Utilisation de TokenAuthentication pour sécuriser les actions admin.
- Mise en place de CORS pour autoriser le frontend React.
- Ajout d’un fichier README détaillé.

## 14. Répartition du travail

Étudiant 1 :

- Backend Django.
- API REST.
- Frontend React.
- Docker.
- CI/CD.

Étudiant 2 :

- README.
- Tests simples.
- Captures d’écran.
- Rapport.
- Relecture des Pull Requests.

## 15. Conclusion

Ce projet a permis de mettre en pratique les notions DevOps : Git, Docker, CI/CD, tests automatisés et documentation. L’application obtenue est fonctionnelle et peut être lancée de manière reproductible.

## 16. Perspectives

- Ajouter un vrai paiement.
- Ajouter une gestion des rôles plus avancée.
- Déployer sur un serveur cloud.
- Ajouter Kubernetes pour le bonus.


## Améliorations version Pro

- Dashboard administrateur avec sidebar.
- Upload des images produit.
- Recherche et filtrage des produits.
- Modal de détails produit.
- Changement du statut des commandes depuis React.
- Alertes de stock faible.


## Amélioration UX

L’interface a été séparée en deux parties : une boutique publique sur `/` et un tableau de bord administrateur sur `/admin`. Le panier est présenté sous forme de tiroir latéral, et le formulaire de commande sous forme de fenêtre modale, ce qui rapproche l’expérience utilisateur des standards des sites e-commerce modernes.


## Améliorations v3

- Homepage plus complète : hero, catégories, section avantages et footer.
- Panier persistant avec localStorage.
- Fenêtre de succès après commande avec numéro de commande.
- Détails de commande dans le dashboard administrateur.
- Impression de facture depuis le dashboard admin.


## Amélioration v4 — Interface administrateur

Les formulaires d'administration ont été masqués par défaut et sont affichés sous forme de fenêtres modales après clic sur un bouton d'action. Cette approche rend le dashboard plus lisible et plus proche des interfaces professionnelles.


## Amélioration v5 — Notifications UX

Les messages de succès et d’erreur sont affichés sous forme de notification centrée animée avec une icône. Cela améliore la clarté du feedback utilisateur dans l’interface administrateur et la boutique.


## Correction finale v5 — Formulaire checkout

Le formulaire checkout a été corrigé afin de conserver le focus dans les champs de saisie. Cette correction améliore l'expérience utilisateur et rend la version plus stable pour la présentation du projet.
## Introduction

The objective of this project is to build a mini e-commerce application while applying DevOps practices.

---

## Objectif du projet

The goal is to create a full-stack e-commerce application with backend, frontend, database, Docker, Git, and CI/CD integration.

---

## Technologies utilisées

- Django REST Framework
- React / Vite
- SQLite / MySQL
- Docker
- Git / GitHub
- GitHub Actions

---

## Architecture

The React frontend communicates with the Django backend API using Axios requests.

The Django backend communicates with the database to manage products, categories, users, and orders.

---

## Fonctionnalités

- Product listing
- Add products to cart
- Checkout and order creation
- Admin authentication
- Products and categories management
- Orders management

---

## Git workflow

The project uses:
- main
- develop
- feature/report
- feature/documentation

Each feature is developed in its own branch before Pull Request.

---

## Docker / Docker Compose

Docker simplifies deployment and execution of the application.

docker-compose includes:
- backend
- frontend
- database

---

## CI/CD

GitHub Actions automatically performs checks and build operations after push.

---

## Difficultés rencontrées

- Backend/frontend configuration
- React and Django API connection
- Database migrations
- Git branches organization

---

## Conclusion

This project helped us understand the DevOps lifecycle including development, version control, Docker, CI/CD, and documentation.
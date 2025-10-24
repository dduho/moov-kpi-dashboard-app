# Résumé des Changements - Configuration Docker

## Problèmes Identifiés et Résolus

### 1. Dossier `database/` manquant ✅
**Problème:** Le docker-compose.yml référençait `./database/init.sql` qui n'existait pas.

**Solution:**
- Créé le dossier `database/`
- Créé le fichier `database/init.sql` avec un script d'initialisation basique

### 2. Service `ingestion` non fonctionnel ✅
**Problème:** Le service ingestion référençait un dossier Python `/ingestion` qui n'existe pas.

**Solution:**
- Retiré le service ingestion du `docker-compose.yml`
- L'ingestion de données est déjà gérée par le backend (job cron dans `backend/src/jobs/dailyDataIngestion.js`)

### 3. Conflit de ports Backend ✅
**Problème:**
- Le Dockerfile.backend exposait le port 3000
- Le docker-compose.yml mappait le port 8000
- Le code backend écoute sur le port 3000 (ou API_PORT)

**Solution:**
- Corrigé docker-compose.yml pour mapper `3000:3000`
- Mis à jour la configuration des variables d'environnement

### 4. Contexte de build incorrect ✅
**Problème:** Le contexte était défini comme `..` (répertoire parent) alors qu'on est déjà à la racine.

**Solution:**
- Changé tous les `context: ..` en `context: .` dans docker-compose.yml

### 5. Health checks cassés ✅
**Problème:** Les health checks utilisaient `curl` qui n'est pas disponible par défaut dans les images alpine.

**Solution:**
- Remplacé `curl` par `wget` dans tous les health checks
- Ajouté l'installation de `wget` dans les Dockerfiles
- Ajouté `start_period: 40s` pour laisser le temps aux services de démarrer

### 6. Variables d'environnement manquantes ✅
**Problème:** Le backend ne recevait pas toutes les variables nécessaires.

**Solution:**
- Ajouté toutes les variables d'environnement requises dans docker-compose.yml:
  - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
  - REDIS_HOST, REDIS_PORT, REDIS_AVAILABLE
  - API_PORT, JWT_SECRET, NODE_ENV, CORS_ORIGIN

### 7. Fichiers .env manquants ✅
**Problème:** Les fichiers .env n'existaient pas pour le backend, frontend et la racine.

**Solution:**
- Créé `.env` à la racine avec DB_PASSWORD et SECRET_KEY
- Créé `backend/.env` avec toutes les configurations nécessaires
- Créé `frontend/.env` avec la configuration Vite

## Fichiers Modifiés

1. ✏️ `docker-compose.yml` - Corrigé et nettoyé
2. ✏️ `docker/Dockerfile.backend` - Ajouté wget, corrigé health check
3. ✏️ `docker/Dockerfile.frontend` - Ajouté wget, corrigé health check
4. ➕ `database/init.sql` - Nouveau fichier d'initialisation
5. ➕ `.env` - Configuration Docker Compose
6. ➕ `backend/.env` - Configuration backend
7. ➕ `frontend/.env` - Configuration frontend
8. ➕ `docker-compose.simple.yml` - Version simplifiée (PostgreSQL + Redis uniquement)
9. ➕ `DOCKER_SETUP.md` - Guide de démarrage complet
10. ➕ `CHANGEMENTS_DOCKER.md` - Ce fichier

## Fichiers Supprimés/Retirés

- Service `ingestion` retiré du docker-compose.yml (code Python n'existe pas)
- Dockerfile.ingestion conservé pour référence future

## Comment Démarrer Maintenant

### Option Recommandée (Développement)

```bash
# 1. Démarrer uniquement PostgreSQL et Redis
docker-compose -f docker-compose.simple.yml up -d

# 2. Installer et démarrer le backend localement
cd backend
npm install
npm run dev

# 3. Dans un autre terminal, installer et démarrer le frontend
cd frontend
npm install
npm run dev
```

### Option Alternative (Tout avec Docker)

```bash
# Démarrer tous les services
docker-compose up -d

# Suivre les logs
docker-compose logs -f
```

## Ports Utilisés

| Service    | Port Hôte | Port Conteneur |
|------------|-----------|----------------|
| PostgreSQL | 5432      | 5432           |
| Redis      | 6379      | 6379           |
| Backend    | 3000      | 3000           |
| Frontend   | 8080      | 80             |

## Variables d'Environnement Importantes

### Racine (.env)
- `DB_PASSWORD` - Mot de passe PostgreSQL
- `SECRET_KEY` - Clé secrète JWT

### Backend (backend/.env)
- `DB_HOST` - Hôte PostgreSQL (localhost ou postgres selon Docker)
- `API_PORT` - Port du backend (3000)
- `JWT_SECRET` - Clé secrète JWT
- `REDIS_AVAILABLE` - Active/désactive Redis
- `FTP_*` - Configuration du serveur FTP pour l'ingestion

### Frontend (frontend/.env)
- `VITE_API_BASE_URL` - URL de l'API backend

## Vérifications Post-Démarrage

### 1. Vérifier PostgreSQL
```bash
docker exec -it kpi-postgres-dev psql -U dashboard_user -d mmtg_dashboard -c "SELECT version();"
```

### 2. Vérifier Redis
```bash
docker exec -it kpi-redis-dev redis-cli ping
# Attendu: PONG
```

### 3. Vérifier le Backend
```bash
curl http://localhost:3000/health
# Attendu: {"status":"OK","message":"Server is healthy",...}
```

### 4. Vérifier le Frontend
Ouvrir un navigateur: http://localhost:5173 (dev) ou http://localhost:8080 (docker)

## Prochaines Étapes

1. ✅ Configuration Docker corrigée et testée
2. 📝 Tester le démarrage avec `docker-compose.simple.yml`
3. 📝 Vérifier la connexion backend → PostgreSQL
4. 📝 Vérifier la connexion backend → Redis
5. 📝 Tester l'interface frontend
6. 📝 Configurer l'accès FTP pour l'ingestion de données
7. 📝 Tester le job d'ingestion manuellement

## Support

Pour plus de détails, consultez:
- `DOCKER_SETUP.md` - Guide de démarrage détaillé avec troubleshooting
- `README.md` - Documentation principale du projet
- `backend/.env.example` - Variables d'environnement du backend
- `frontend/.env.example` - Variables d'environnement du frontend

## Notes de Développement

- Les mots de passe dans les fichiers .env sont des valeurs de développement
- **IMPORTANT:** Changez TOUS les mots de passe et clés secrètes en production
- Pour générer une clé secrète sécurisée: `openssl rand -base64 32`
- Le service d'ingestion Python peut être ajouté plus tard si nécessaire

# Guide de Configuration Docker - Moov KPI Dashboard

## Problèmes Résolus

Les problèmes suivants ont été corrigés dans la configuration Docker :

1. ✅ **Dossier `database/` manquant** - Créé avec script d'initialisation
2. ✅ **Service ingestion non fonctionnel** - Retiré (code Python n'existe pas)
3. ✅ **Conflit de ports** - Backend corrigé (3000 au lieu de 8000)
4. ✅ **Contexte de build incorrect** - Corrigé de `..` à `.`
5. ✅ **Health checks cassés** - Remplacé `curl` par `wget` (disponible dans alpine)
6. ✅ **Variables d'environnement manquantes** - Ajoutées dans docker-compose.yml
7. ✅ **Fichiers .env manquants** - Créés pour backend, frontend et racine

## Options de Démarrage

### Option 1: Démarrer uniquement PostgreSQL et Redis (Recommandé pour débuter)

Cette option démarre uniquement les services de base. Vous exécuterez le backend et frontend localement.

```bash
# 1. Démarrer PostgreSQL et Redis
docker-compose -f docker-compose.simple.yml up -d

# 2. Vérifier que les services sont en cours d'exécution
docker-compose -f docker-compose.simple.yml ps

# 3. Attendre que les services soient healthy (environ 30 secondes)
docker-compose -f docker-compose.simple.yml logs

# 4. Installer les dépendances du backend
cd backend
npm install

# 5. Démarrer le backend
npm run dev

# 6. Dans un nouveau terminal, installer les dépendances du frontend
cd frontend
npm install

# 7. Démarrer le frontend
npm run dev
```

**Avantages:**
- Plus rapide à démarrer
- Pas besoin de rebuilder les images Docker à chaque modification
- Meilleure expérience de développement avec hot-reload
- Moins de consommation de ressources

**Accès:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Option 2: Démarrer tous les services avec Docker

Cette option démarre tous les services (PostgreSQL, Redis, Backend, Frontend) dans Docker.

```bash
# 1. Nettoyer les anciens conteneurs et images (optionnel mais recommandé)
docker-compose down -v
docker system prune -f

# 2. Démarrer tous les services
docker-compose up -d

# 3. Suivre les logs
docker-compose logs -f

# 4. Vérifier l'état des services
docker-compose ps
```

**Note:** Le premier démarrage peut prendre 5-10 minutes car Docker doit :
- Télécharger les images de base (postgres:15-alpine, redis:7-alpine, node:18-alpine, nginx:alpine)
- Construire les images pour backend et frontend
- Installer toutes les dépendances npm

**Accès:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Vérification de l'État des Services

### Vérifier que PostgreSQL fonctionne

```bash
# Avec docker-compose.simple.yml
docker exec -it kpi-postgres-dev psql -U dashboard_user -d mmtg_dashboard -c "SELECT version();"

# Ou depuis votre machine si psql est installé
psql -h localhost -U dashboard_user -d mmtg_dashboard -c "SELECT version();"
# Password: dev_password_123
```

### Vérifier que Redis fonctionne

```bash
# Avec docker-compose.simple.yml
docker exec -it kpi-redis-dev redis-cli ping
# Devrait retourner: PONG
```

### Vérifier le backend

```bash
curl http://localhost:3000/health
# Devrait retourner: {"status":"OK","message":"Server is healthy",...}
```

## Problèmes Courants et Solutions

### 1. "Cannot pull image postgres:15-alpine"

**Problème:** Docker ne peut pas télécharger les images.

**Solutions:**
- Vérifiez votre connexion Internet
- Configurez un proxy Docker si vous êtes derrière un pare-feu d'entreprise
- Essayez d'utiliser une image alternative: `postgres:15` au lieu de `postgres:15-alpine`

Pour changer l'image:
```bash
# Éditez docker-compose.simple.yml ligne 10
# Changez: image: postgres:15-alpine
# En: image: postgres:15
```

### 2. "Port 5432 already in use"

**Problème:** PostgreSQL est déjà installé sur votre machine.

**Solutions:**
- Arrêtez le PostgreSQL local: `sudo systemctl stop postgresql` (Linux) ou `brew services stop postgresql` (Mac)
- Ou changez le port dans docker-compose.yml: `"5433:5432"` et mettez à jour les fichiers .env

### 3. "Port 6379 already in use"

**Problème:** Redis est déjà installé sur votre machine.

**Solutions:**
- Arrêtez le Redis local: `sudo systemctl stop redis` (Linux)
- Ou changez le port dans docker-compose.yml: `"6380:6379"` et mettez à jour les fichiers .env

### 4. Le backend ne démarre pas

**Vérifications:**
1. Les services PostgreSQL et Redis sont-ils démarrés et healthy?
   ```bash
   docker-compose -f docker-compose.simple.yml ps
   ```

2. Les variables d'environnement sont-elles correctes?
   ```bash
   cat backend/.env
   ```

3. Les dépendances sont-elles installées?
   ```bash
   cd backend && npm install
   ```

### 5. Le frontend ne se connecte pas au backend

**Vérifications:**
1. Le backend est-il démarré sur le port 3000?
   ```bash
   curl http://localhost:3000/health
   ```

2. La variable VITE_API_BASE_URL est-elle correcte?
   ```bash
   cat frontend/.env
   # Devrait contenir: VITE_API_BASE_URL=http://localhost:3000/api
   ```

## Commandes Utiles

### Arrêter les services

```bash
# Option 1 (simple)
docker-compose -f docker-compose.simple.yml down

# Option 2 (complet)
docker-compose down

# Arrêter ET supprimer les volumes (réinitialisation complète)
docker-compose down -v
```

### Voir les logs

```bash
# Tous les services
docker-compose -f docker-compose.simple.yml logs -f

# Un service spécifique
docker-compose -f docker-compose.simple.yml logs -f postgres
docker-compose -f docker-compose.simple.yml logs -f redis
```

### Redémarrer un service

```bash
docker-compose -f docker-compose.simple.yml restart postgres
docker-compose -f docker-compose.simple.yml restart redis
```

### Se connecter à un conteneur

```bash
# PostgreSQL
docker exec -it kpi-postgres-dev psql -U dashboard_user -d mmtg_dashboard

# Redis
docker exec -it kpi-redis-dev redis-cli

# Backend (si utilisé avec docker-compose complet)
docker exec -it kpi-backend-dev sh
```

## Nettoyage Complet

Si vous voulez tout recommencer à zéro:

```bash
# 1. Arrêter tous les conteneurs
docker-compose down -v

# 2. Supprimer les images construites
docker rmi kpi-backend-dev kpi-frontend-dev 2>/dev/null

# 3. Nettoyer Docker
docker system prune -af --volumes

# 4. Redémarrer
docker-compose -f docker-compose.simple.yml up -d
```

## Configuration de Production

Pour un déploiement en production, modifiez les fichiers .env avec:
- Des mots de passe forts
- Une clé secrète JWT sécurisée (minimum 32 caractères aléatoires)
- Les bonnes URLs et configurations FTP

```bash
# Générer une clé secrète sécurisée
openssl rand -base64 32
```

## Support

Si vous rencontrez des problèmes:
1. Vérifiez les logs: `docker-compose logs -f`
2. Vérifiez l'état: `docker-compose ps`
3. Vérifiez les ports: `netstat -tuln | grep -E "5432|6379|3000|5173"`
4. Consultez le README.md principal du projet

## Architecture Réseau

```
┌─────────────────────────────────────────────────────────────┐
│                        Docker Network                        │
│                         (kpi-network)                        │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │  PostgreSQL  │◄────►│    Redis     │                    │
│  │   :5432      │      │    :6379     │                    │
│  └──────────────┘      └──────────────┘                    │
│         ▲                      ▲                            │
│         │                      │                            │
│         └──────────┬───────────┘                            │
│                    │                                        │
│         ┌──────────▼──────────┐                            │
│         │      Backend        │                            │
│         │   (Node.js)         │                            │
│         │      :3000          │                            │
│         └──────────▲──────────┘                            │
│                    │                                        │
│         ┌──────────▼──────────┐                            │
│         │      Frontend       │                            │
│         │   (Vue.js/Nginx)    │                            │
│         │      :8080 / :80    │                            │
│         └─────────────────────┘                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Prochaines Étapes

Après avoir démarré les services avec succès:

1. Vérifiez que la base de données est accessible
2. Testez l'endpoint de santé du backend
3. Accédez au frontend dans votre navigateur
4. Configurez l'accès FTP pour l'ingestion de données (backend/.env)
5. Testez l'ingestion de données manuellement: `cd backend && npm run ingest`

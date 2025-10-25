# Development Scripts

## 🚀 Démarrage rapide du développement

### Option recommandée : Développement hybride (Docker + Local)
```bash
# Windows (CMD)
start-dev.bat

# Windows (PowerShell)
.\start-dev.ps1

# Linux/Mac
./start-dev.sh
```

Cette approche :
- ✅ Lance la base de données, Redis et le backend dans Docker
- ✅ Lance le frontend localement avec Vite (hot reload ultra-rapide)
- ✅ Meilleure performance et fiabilité du hot reload

### Option alternative : Tout dans Docker
```bash
# Lancer tous les services en mode développement
docker-compose up -d postgres redis backend frontend-dev

# Accéder à l'application sur http://localhost:5173
```

⚠️ **Note** : Le hot reload dans Docker peut être moins fiable sur Windows.

### Option 3 : Développement 100% local
```bash
# Assurer que PostgreSQL et Redis tournent localement
# Puis dans le dossier frontend :
cd frontend
npm install
npm run dev
```

## 🔧 Configuration

### Variables d'environnement
Créez un fichier `.env` à la racine :
```env
DB_PASSWORD=votre_mot_de_passe
SECRET_KEY=votre_cle_secrete
```

### API Configuration
Le frontend se connecte automatiquement à l'API selon l'environnement :
- **Développement local** : `http://localhost:8000/api`
- **Docker** : `http://localhost:8000/api`

## 📁 Structure du projet

```
frontend/
├── src/
│   ├── components/     # Composants réutilisables
│   ├── views/         # Pages/vues principales
│   ├── router/        # Configuration des routes
│   ├── stores/        # État global (Pinia)
│   └── assets/        # Styles, images, etc.
├── public/            # Fichiers statiques
└── vite.config.js     # Configuration Vite
```

## 🛠️ Commandes utiles

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build pour la production
npm run build

# Linting
npm run lint

# Tests (quand configurés)
npm run test
```

## 🐳 Docker Commands

```bash
# Lancer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Voir les logs
docker-compose logs -f [service-name]

# Reconstruire un service
docker-compose up -d --build [service-name]
```

## 🔍 Debugging

### Hot Reload ne fonctionne pas ?
1. Vérifiez que vous utilisez `npm run dev` (pas Docker pour le frontend)
2. Assurez-vous que le port 5173 n'est pas occupé
3. Redémarrez le serveur de développement

### API non accessible ?
1. Vérifiez que le backend Docker tourne : `docker-compose ps`
2. Testez l'API : `curl http://localhost:8000/health`
3. Vérifiez les variables d'environnement

### Base de données ?
1. Vérifiez PostgreSQL : `docker-compose logs postgres`
2. Testez la connexion dans le backend logs
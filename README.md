# JustChat

JustChat est une application de messagerie instantanée qui vous permet de communiquer avec de nombreuses personnes en temps réel. Il offre une expérience de chat fluide et conviviale pour vous connecter et interagir avec vos amis, votre famille et vos collègues.

![Home page of JustChat](https://res.cloudinary.com/e-tech-test/image/upload/v1704836134/ogmuidb6v7ltw3vejwak.png)

## Technologies utilisées
### Front-End
- React
- Typescript
- React-Query
- Redux
- Vitest

### Back-End
- Node.js
- Express
- Websocket
- MongoDB
- Jest

## Installation
Pour exécuter localement votre propre instance de JustChat, suivez ces étapes :

1. Clonez ce dépôt sur votre machine :
`git clone https://github.com/R0BIN0/JustChat.git`

2. Accédez au répertoire du projet :
`cd justChat`

3. Installez les dépendances du Client:
`cd client`
`npm install`

4. Installez les dépendances du Serveur :
`cd server`
`npm install`

5. Configurer le .env :
`créer un fichier ".env" à la racine du dossier "server"` et insérer dedans :

| Clé | Valeur |
| ----------- | ----------- |
| LOCAL_DB_URL | <YOUR_MONGO_DB_URL> |
| JWT_EXPIRE | "24h" |
| JWT_SECRET | <YOUR_JWT_SECRET> |
| ENCRYPTION_SECRET | <YOUR_ENCRYPTION_SECRET> (clé utilisée pour le chiffrement AES-256-GCM des messages en base) |

6. Lancer le Client :
`cd client`
`npm run dev`

7. Lancer le Serveur :
`cd server`
`npm run server`

8. Accédez à l'application dans votre navigateur à l'adresse : http://localhost:3000

## Fonctionnalités clés

### Messagerie
- **Chat en temps réel** avec d'autres utilisateurs via WebSocket.
- **Historique des messages** avec pagination : chargement des messages plus anciens au scroll (infinite scroll).
- **Envoi de texte et d’images** : pièce jointe d’images (upload côté serveur, compression et redimensionnement), avec possibilité d’envoyer plusieurs images à la fois.
- **Grille de photos** : les messages contenant uniquement des images et consécutifs du même expéditeur sont affichés en groupe (grille).
- **Lightbox** : clic sur une image pour l’agrandir avec zoom (yet-another-react-lightbox).
- **Sélecteur d’emoji** dans la zone de saisie (emoji-picker-react) pour insérer des emojis dans les messages.

### Utilisateurs et compte
- **Inscription** (nom, email, mot de passe, confirmation, choix d’avatar).
- **Connexion / déconnexion** avec JWT (token en session).
- **Profil** : modification du nom, de l’email et de l’avatar (dialogue « Modifier le profil »).
- **Suppression du compte** (dialogue de confirmation).
- **Liste des utilisateurs** avec recherche et scroll infini pour charger plus d’utilisateurs.
- **Statut en ligne / hors ligne** : mise à jour en temps réel via WebSocket (connexion/déconnexion).

### Conversations
- **Création automatique** d’une conversation au premier échange entre deux utilisateurs.
- **Suppression d’une conversation** : effacement de tous les messages de la conversation pour les deux participants, avec notification en temps réel (dialogue « Supprimer la conversation » depuis le bandeau du chat).

### Sécurité et technique
- **Chiffrement des messages** : contenus (texte et images) chiffrés en base avec AES-256-GCM ; clé via `ENCRYPTION_SECRET`.
- **Routes protégées** : accès à `/home` et `/chat/:id` réservé aux utilisateurs connectés (PrivateRoutes).
  
![Home page of JustChat](https://res.cloudinary.com/e-tech-test/image/upload/v1704837442/e5sokbt5vapgsjpzna2f.png)

Profitez de JustChat pour communiquer avec vos amis, collègues et proches de manière instantanée !










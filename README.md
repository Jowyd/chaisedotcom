# vue-project ChaiseDotCom

KEOVILAY Lyam
MANGINI Raphaël
WEB

## Installation guide
- Front-end
  - `npm install`
- Back-end
  - `npm install`

Copier le fichier `.env.example` et le renommer en `.env` dans le dossier `api` et remplir les champs.



## Déploiement
### Production
#### Front-end
- `cd front`
- `npm run build`
- Copier le contenu du dossier `dist` dans le dossier `api/public`

#### Back-end
- `cd ..`
- `cd api`
- `npm run build`
- `npm start`
- Le site est accessible à l'adresse `http://localhost:3000`
- 
### Développement
#### Front-end
- `cd front`
- `npm run dev`
- Le site est accessible à l'adresse `http://localhost:5173/` si elle n'a pas été modifiée
#### Back-end
- `cd ..`
- `cd api`
- `npm run dev`
- Le l'api est accessible à l'adresse `http://localhost:3000`
## Fonctionnalités

### Connexion
- Possibilité de se connecter
- Possibilité de s'inscrire
- Possibilité de modifier son profil
- Possibilité de mettre son profil en public ou privé
- Possibilité de mettre ses parties en public ou privé

### Partie d'échecs
- Jouer contre un autre joueur sur le même ordinateur
- Possibilité de revoir un coup
- Possibilité de charger une partie
- Possibilité de mettre sa partie en public ou privé
- Rotation du board
- Possibilité de reprendre une partie en cours
- Possibilité de revoir les coups d'une partie

### Divers
- Possibilité de voir son historique de partie
- Possibilité de voir le classement des meilleurs joueurs
- Possibilité de voir ses propres statistiques
- Possibilité de revoir les parties d'un autre joueur
- Possibilité de voir l'historique de partie d'un autre joueur en public
- Possibilité de voir les statistiques d'un autre joueur en public




différence entre CI et CD 
questions sur le yaml
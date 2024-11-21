#!/bin/bash
# Nettoyer les caractères de retour chariot (Windows) dans le fichier .env
sed -i 's/\r//' .env

if [ -f .env ]; then
     export $(cat .env | xargs)
fi

# Vérifier que les variables nécessaires sont définies
if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_PORT" ]; then
    echo "Erreur : certaines variables d'environnement manquent. Assurez-vous que DB_NAME, DB_USER, DB_PASSWORD, DB_PORT sont définies dans .env."
    exit 1
fi

echo "Starting MariaDB container..."
echo "DB_NAME: $DB_NAME"
echo "DB_USER: $DB_USER"
echo "DB_PASSWORD: $DB_PASSWORD"
echo "DB_PORT: $DB_PORT"


# Start the container if it is already running
if [ "$(docker ps -a -q -f name=mariadb-$DB_NAME)" ]; then
    echo "Starting existing MariaDB container..." 
    docker start mariadb-$DB_NAME
    exit 0
fi

docker run --detach -p $DB_PORT:3306 --name mariadb-$DB_NAME --env MARIADB_USER=$DB_USER --env MARIADB_PASSWORD=$DB_PASSWORD --env MARIADB_DATABASE=$DB_NAME --env MARIADB_ROOT_PASSWORD=$DB_PASSWORD -v ./db.sql:/docker-entrypoint-initdb.d/init.sql mariadb:latest


npm run dev
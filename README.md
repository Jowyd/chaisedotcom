```bash
docker run --name some-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=chaisedotcom -p 5432:5432 -d postgres:latest

psql -U postgres -d chaisedotcom
```

# TODO
- Models:
  - User
  - Game
  - Move
- Routes:
  - User
    - Login
    - Register
    - Logout
    - History
  - Game:
    - Create
    - Play
    - Get-moves
  - Move:
    - Get
    - Create
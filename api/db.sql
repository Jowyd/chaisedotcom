create table if not exists users (
    id serial primary key,
    username varchar(255) not null,
    password varchar(255) not null,
    created_at timestamp default current_timestamp
);
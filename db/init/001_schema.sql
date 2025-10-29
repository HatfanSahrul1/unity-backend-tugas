create table if not exists db_user (
    id int auto_increment primary key,
    username varchar(50) not null unique,
    password_hash varchar(255) not null,
    created_at timestamp default current_timestamp
);

create table if not exists db_attributes (
    id int auto_increment primary key,
    player_id int,
    score int,
    coin int,
    green_skin tinyint(1) default 0,
    red_skin tinyint(1) default 0,
    blue_skin tinyint(1) default 0,
    foreign key (player_id) references db_user(id)
);
DROP TABLE IF EXISTS booktable;


CREATE TABLE IF NOT EXISTS booktable (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    author VARCHAR(255),
    img VARCHAR(255), 
    description TEXT
);
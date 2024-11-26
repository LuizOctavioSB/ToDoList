CREATE TABLE tarefas (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE,
    custo NUMERIC(10,2),
    data_limite DATE,
    ordem_apresentacao INTEGER NOT NULL UNIQUE
);

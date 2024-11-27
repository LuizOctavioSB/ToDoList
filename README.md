# Sistema de Lista de Tarefas

## Descrição

O **Sistema de Lista de Tarefas** é uma aplicação web que permite aos usuários gerenciar tarefas pendentes e concluídas. Ele suporta funcionalidades como adição, edição, exclusão, e marcação de tarefas como concluídas. Além disso, possui validação e sanitização de entradas para garantir segurança contra ataques como SQL Injection e XSS.

---

## Funcionalidades

- Adicionar tarefas com **nome**, **data limite** (opcional) e **custo** (opcional).
- Listar tarefas pendentes e concluídas separadamente.
- Editar tarefas pendentes.
- Excluir tarefas pendentes ou concluídas.
- Mover tarefas entre as listas de pendentes e concluídas.
- Reorganizar tarefas pendentes com suporte a drag-and-drop.
- Mostrar/ocultar tarefas concluídas.
- Validação e sanitização de dados para evitar injeções SQL e XSS.

---

## Tecnologias Utilizadas

<<<<<<< HEAD
- **Frontend:**
  - HTML5
  - CSS3
  - JavaScript
- **Backend:**
  - PHP
- **Banco de Dados:**
  - MySQL
- **Outros:**
  - PDO para conexões seguras com o banco de dados.
  - Fontes do Google Fonts.

---

## Estrutura de Arquivos

```plaintext
├── index.php        # Página principal da aplicação
├── config.php       # Configuração do banco de dados
├── api.php          # Backend para API REST
├── assets/
│   ├── css/
│   │   └── style.css  # Estilos da aplicação
│   ├── js/
│   │   └── script.js  # Scripts do frontend
│   ├── icons/
│       ├── delete.svg # Ícone para exclusão
│       └── edit.svg   # Ícone para edição
├── fatto.sql        # Script SQL para criação e configuração do banco de dados
└── README.md        # Documentação do projeto
```

---

## Endpoints da API

### `GET /api.php?action=list`

- **Descrição:** Retorna todas as tarefas pendentes e concluídas.
- **Resposta:**
  ```json
  {
      "pendentes": [
          {"id": 1, "nome": "Tarefa 1", "custo": 500.00, "data_limite": "2024-12-31"},
          ...
      ],
      "concluidas": [
          {"id": 2, "nome": "Tarefa 2", "custo": 1500.00, "data_limite": "2024-11-30"},
          ...
      ]
  }
  ```

### `POST /api.php?action=add`

- **Descrição:** Adiciona uma nova tarefa.
- **Campos obrigatórios:** `nome`
- **Campos opcionais:** `custo`, `data_limite`

### `POST /api.php?action=update`

- **Descrição:** Atualiza uma tarefa pendente existente.
- **Campos obrigatórios:** `id`, `nome`
- **Campos opcionais:** `custo`, `data_limite`

### `POST /api.php?action=delete`

- **Descrição:** Exclui uma tarefa.

### `POST /api.php?action=toggle`

- **Descrição:** Alterna o status de uma tarefa (pendente/concluída).

---

## Segurança

- **Sanitização de entradas:** Todas as entradas de usuário são sanitizadas com `htmlspecialchars` e `strip_tags` para evitar XSS.
- **Prepared Statements:** Todas as consultas ao banco de dados utilizam `PDO::prepare` para evitar injeções SQL.
- **Validação de dados:** Verificação de formatos válidos para datas e limites de comprimento nos campos de texto.
=======
Tecnologias Utilizadas:
HTML5
CSS3
JavaScript (ES6+)
>>>>>>> b2f4d330196ba9dc7105c542ac05ce22428b67d6

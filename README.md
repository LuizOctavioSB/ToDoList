# Sistema de Lista de Tarefas

## Descrição

O **Sistema de Lista de Tarefas** é uma aplicação web desenvolvida para facilitar o gerenciamento de tarefas do usuário, permitindo a organização de tarefas pendentes e concluídas de forma prática. A aplicação inclui funcionalidades para adicionar, editar, excluir, mover entre listas e marcar como concluídas, oferecendo também segurança através da validação e sanitização de entradas, prevenindo ataques como SQL Injection e XSS.

---

## Funcionalidades

- **Adicionar tarefas**: Cada tarefa pode ter um **nome**, **data limite** (opcional) e **custo** (opcional).
- **Listagem de tarefas**: Exibe as tarefas **pendentes** e **concluídas** separadamente.
- **Editar tarefas**: Permite editar informações de tarefas pendentes.
- **Excluir tarefas**: É possível excluir tanto tarefas pendentes quanto concluídas.
- **Mover tarefas**: Mover tarefas entre as listas de pendentes e concluídas.
- **Reorganizar tarefas**: Suporte a **drag-and-drop** para reorganização das tarefas pendentes.
- **Mostrar/ocultar tarefas concluídas**: Possibilidade de mostrar ou ocultar as tarefas já finalizadas.
- **Validação e sanitização de dados**: Prevenção contra ataques como **injeção SQL** e **XSS**.

---

## Tecnologias Utilizadas

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

## Segurança

- **Sanitização de entradas:** Todas as entradas de usuário são sanitizadas com `htmlspecialchars` e `strip_tags` para evitar XSS.
- **Prepared Statements:** Todas as consultas ao banco de dados utilizam `PDO::prepare` para evitar injeções SQL.
- **Validação de dados:** Verificação de formatos válidos para datas e limites de comprimento nos campos de texto.

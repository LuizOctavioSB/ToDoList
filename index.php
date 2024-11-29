<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema Lista de Tarefas</title>
    <link rel="icon" href="assets/icons/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>

<body>
    <header>
        <h1><i class="fa-solid fa-list-check"></i> Sistema Lista de Tarefas</h1>
    </header>
    <main>
        <div id="message"></div>

        <!-- Formulário para adicionar novas tarefas -->
        <div class="task-input" id="task-input-form">
            <input type="text" id="new-task" placeholder="Adicionar nova tarefa">
            <input type="date" id="task-date" placeholder="Data Limite">
            <input type="text" id="task-cost" placeholder="Custo (R$)">
            <button id="add-task">Incluir Registro</button>
        </div>

        <!-- Lista de Tarefas Pendentes -->
        <ul id="task-list-pending"></ul>

        <!-- Botão para mostrar/ocultar tarefas concluídas -->
        <div class="toggle-completed">
            <button id="toggle-completed">Mostrar Tarefas Concluídas</button>
        </div>

        <!-- Botão para incluir novo registro -->
        <div id="include-record" class="include-record">
            <button id="include-record-button">Incluir Registro</button>
        </div>

        <!-- Lista de Tarefas Concluídas -->
        <ul id="task-list-completed"></ul>

        <!-- Modal de Confirmação de Exclusão -->
        <div id="confirmation-modal" class="modal">
            <div class="modal-content">
                <p>Tem certeza que deseja excluir esta tarefa?</p>
                <div class="modal-actions">
                    <button id="confirm-delete" class="modal-confirm-button">Excluir</button>
                    <button id="cancel-delete" class="modal-cancel-button">Cancelar</button>
                </div>
            </div>
        </div>
    </main>

    <footer id="footer-contatos">
        <p>Luiz Octávio Sacchetin de Bortoli</p>
        <a href="mailto:luizoctavios14@gmail.com" class="email-contact">luizoctavios14@gmail.com</a>
        <div class="social-links">
            <a href="https://github.com/LuizOctavioSB" target="_blank"><i class="fab fa-github"></i></a>
            <a href="https://www.linkedin.com/in/luizoctaviosb/" target="_blank"><i class="fab fa-linkedin"></i></a>
        </div>
    </footer>

    <script src="assets/js/script.js"></script>
</body>

</html>
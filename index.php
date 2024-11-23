<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <title>Minha Lista de Tarefas</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link href="https://fonts.googleapis.com/css?family=Roboto&display=swap" rel="stylesheet">
</head>

<body>
    <header>
        <h1>Minha Lista de Tarefas</h1>
    </header>
    <main>
        <div id="message"></div>

        <div class="task-input">
            <input type="text" id="new-task" placeholder="Adicionar nova tarefa">
            <input type="date" id="task-date" placeholder="Data Limite">
            <input type="text" id="task-cost" placeholder="Custo (R$)">
            <button id="add-task">Adicionar Tarefa</button>
        </div>

        <ul id="task-list">
            <!-- Tarefas pendentes serão inseridas aqui -->
        </ul>

        <ul id="completed-task-list">
            <!-- Tarefas concluídas serão inseridas aqui -->
        </ul>

    </main>

    <!-- Modal de Confirmação -->
    <div id="confirmation-modal" class="modal">
        <div class="modal-content">
            <p>Tem certeza que deseja excluir esta tarefa?</p>
            <div class="modal-actions">
                <button id="confirm-delete" class="modal-confirm-button">Excluir</button>
                <button id="cancel-delete" class="modal-cancel-button">Cancelar</button>
            </div>
        </div>
    </div>

    <script src="assets/js/script.js"></script>
</body>

</html>
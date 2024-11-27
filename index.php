<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <title>Minha Lista de Tarefas</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>

<body>
    <header>
        <h1>Sistema Lista de Tarefas</h1>
    </header>
    <main>
        <div id="message"></div>

        <!-- Formulário para adicionar novas tarefas -->
        <div class="task-input">
            <input type="text" id="new-task" placeholder="Adicionar nova tarefa">
            <input type="date" id="task-date" placeholder="Data Limite">
            <input type="text" id="task-cost" placeholder="Custo (R$)">
            <button id="add-task">Adicionar Tarefa</button>
        </div>

        <!-- Lista de Tarefas Pendentes -->
        <ul id="task-list-pending"></ul>

        <!-- Botão para mostrar/ocultar tarefas concluídas -->
        <div class="toggle-completed">
            <button id="toggle-completed">Mostrar Tarefas Concluídas</button>
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
    <script src="assets/js/script.js"></script>
</body>

</html>
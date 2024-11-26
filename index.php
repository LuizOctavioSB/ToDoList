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

        <!-- Formulário para adicionar novas tarefas -->
        <div class="task-input">
            <input type="text" id="new-task" placeholder="Adicionar nova tarefa">
            <input type="date" id="task-date" placeholder="Data Limite">
            <input type="text" id="task-cost" placeholder="Custo (R$)">
            <button id="add-task">Adicionar Tarefa</button>
        </div>

        <!-- Lista de Tarefas Pendentes -->
        <h2>Tarefas Pendentes</h2>
        <ul id="task-list-pending">
            <!-- Tarefas pendentes serão inseridas aqui -->
        </ul>

        <!-- Botão para mostrar/ocultar tarefas concluídas -->
        <div class="toggle-completed">
            <button id="toggle-completed">Mostrar Tarefas Concluídas</button>
        </div>

        <!-- Lista de Tarefas Concluídas (inicialmente oculta via CSS) -->
        <h2>Tarefas Concluídas</h2>
        <ul id="task-list-completed">
            <!-- Tarefas concluídas serão inseridas aqui -->
        </ul>

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
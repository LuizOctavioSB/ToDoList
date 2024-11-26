<?php
header('Content-Type: application/json');

require 'config.php';

// Habilitar exibição de erros para depuração (apenas em desenvolvimento)
// Remova ou comente estas linhas em produção para evitar a exposição de informações sensíveis
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Função auxiliar para retornar erro e encerrar o script
function returnError($message, $code = 400)
{
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit();
}

// Obter a ação a ser executada a partir da URL
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'list':
        // Listar todas as tarefas ordenadas por 'concluida' e 'ordem_apresentacao'
        try {
            $stmt = $pdo->prepare('SELECT id, nome, custo, data_limite, concluida FROM tarefas ORDER BY concluida ASC, ordem_apresentacao ASC');
            $stmt->execute();
            $tarefas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($tarefas);
        } catch (Exception $e) {
            error_log("Erro ao listar tarefas: " . $e->getMessage());
            returnError('Erro ao listar tarefas.', 500);
        }
        break;

    case 'add':
        // Adicionar uma nova tarefa
        $data = json_decode(file_get_contents('php://input'), true);
        $nome = trim($data['nome'] ?? '');
        $custo = floatval($data['custo'] ?? 0);
        $data_limite = $data['data_limite'] ?? null;

        if ($nome === '') {
            returnError('O nome da tarefa é obrigatório.', 400);
        }

        try {
            // Verificar duplicação de nome (case insensitive)
            $stmt = $pdo->prepare('SELECT COUNT(*) FROM tarefas WHERE LOWER(nome) = LOWER(?)');
            $stmt->execute([$nome]);
            if ($stmt->fetchColumn() > 0) {
                returnError('Já existe uma tarefa com esse nome.', 400);
            }

            // Obter a próxima ordem de apresentação
            $stmt = $pdo->prepare('SELECT COALESCE(MAX(ordem_apresentacao), 0) + 1 FROM tarefas');
            $stmt->execute();
            $ordem = intval($stmt->fetchColumn());

            // Inserir a nova tarefa
            $stmt = $pdo->prepare('INSERT INTO tarefas (nome, custo, data_limite, ordem_apresentacao, concluida) VALUES (?, ?, ?, ?, FALSE)');
            $stmt->execute([$nome, $custo, $data_limite, $ordem]);

            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            error_log("Erro ao adicionar tarefa: " . $e->getMessage());
            returnError('Erro ao adicionar tarefa.', 500);
        }
        break;

    case 'update':
        // Atualizar uma tarefa existente
        $data = json_decode(file_get_contents('php://input'), true);
        $id = intval($data['id'] ?? 0);
        $nome = trim($data['nome'] ?? '');
        $custo = floatval($data['custo'] ?? 0);
        $data_limite = $data['data_limite'] ?? null;

        if ($id <= 0) {
            returnError('ID da tarefa inválido.', 400);
        }

        if ($nome === '') {
            returnError('O nome da tarefa é obrigatório.', 400);
        }

        try {
            // Verificar se a tarefa existe
            $stmt = $pdo->prepare('SELECT COUNT(*) FROM tarefas WHERE id = ?');
            $stmt->execute([$id]);
            if ($stmt->fetchColumn() == 0) {
                returnError('Tarefa não encontrada.', 404);
            }

            // Verificar duplicação de nome (case insensitive), excluindo a tarefa atual
            $stmt = $pdo->prepare('SELECT COUNT(*) FROM tarefas WHERE LOWER(nome) = LOWER(?) AND id != ?');
            $stmt->execute([$nome, $id]);
            if ($stmt->fetchColumn() > 0) {
                returnError('Já existe uma tarefa com esse nome.', 400);
            }

            // Atualizar a tarefa
            $stmt = $pdo->prepare('UPDATE tarefas SET nome = ?, custo = ?, data_limite = ? WHERE id = ?');
            $stmt->execute([$nome, $custo, $data_limite, $id]);

            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            error_log("Erro ao atualizar tarefa: " . $e->getMessage());
            returnError('Erro ao atualizar tarefa.', 500);
        }
        break;

    case 'delete':
        // Excluir uma tarefa
        $data = json_decode(file_get_contents('php://input'), true);
        $id = intval($data['id'] ?? 0);

        if ($id <= 0) {
            returnError('ID da tarefa inválido.', 400);
        }

        try {
            // Verificar se a tarefa existe
            $stmt = $pdo->prepare('SELECT concluida, ordem_apresentacao FROM tarefas WHERE id = ?');
            $stmt->execute([$id]);
            $tarefa = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$tarefa) {
                returnError('Tarefa não encontrada.', 404);
            }

            // Excluir a tarefa
            $stmt = $pdo->prepare('DELETE FROM tarefas WHERE id = ?');
            $stmt->execute([$id]);

            // Reordenar as tarefas após a exclusão para manter a sequência
            // Primeiro, obter todas as tarefas, ordenadas por 'concluida' ASC e 'ordem_apresentacao' ASC
            $stmt = $pdo->prepare('SELECT id FROM tarefas ORDER BY concluida ASC, ordem_apresentacao ASC');
            $stmt->execute();
            $tarefas = $stmt->fetchAll(PDO::FETCH_COLUMN);

            // Iniciar transação
            $pdo->beginTransaction();
            try {
                $ordem = 1;
                foreach ($tarefas as $tarefa_id) {
                    $stmt_update = $pdo->prepare('UPDATE tarefas SET ordem_apresentacao = ? WHERE id = ?');
                    $stmt_update->execute([$ordem, $tarefa_id]);
                    $ordem++;
                }
                $pdo->commit();
            } catch (Exception $e) {
                $pdo->rollBack();
                error_log("Erro ao reordenar tarefas após exclusão: " . $e->getMessage());
                returnError('Erro ao reordenar tarefas após exclusão.', 500);
            }

            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            error_log("Erro ao excluir tarefa: " . $e->getMessage());
            returnError('Erro ao excluir tarefa.', 500);
        }
        break;

    case 'toggle':
        // Alternar o status de conclusão da tarefa
        $data = json_decode(file_get_contents('php://input'), true);
        $id = intval($data['id'] ?? 0);
        $concluida = isset($data['concluida']) ? boolval($data['concluida']) : false;

        if ($id <= 0) {
            returnError('ID da tarefa inválido.', 400);
        }

        try {
            // Verificar se a tarefa existe
            $stmt = $pdo->prepare('SELECT concluida FROM tarefas WHERE id = ?');
            $stmt->execute([$id]);
            $tarefa = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$tarefa) {
                returnError('Tarefa não encontrada.', 404);
            }

            // Atualizar o status de conclusão
            $stmt = $pdo->prepare('UPDATE tarefas SET concluida = ? WHERE id = ?');
            $stmt->execute([$concluida, $id]);

            // Reordenar todas as tarefas após a mudança de status
            // Primeiro, obter todas as tarefas ordenadas por 'concluida' ASC e 'ordem_apresentacao' ASC
            $stmt = $pdo->prepare('SELECT id FROM tarefas ORDER BY concluida ASC, ordem_apresentacao ASC');
            $stmt->execute();
            $tarefas = $stmt->fetchAll(PDO::FETCH_COLUMN);

            // Iniciar transação
            $pdo->beginTransaction();
            try {
                $ordem = 1;
                foreach ($tarefas as $tarefa_id) {
                    $stmt_update = $pdo->prepare('UPDATE tarefas SET ordem_apresentacao = ? WHERE id = ?');
                    $stmt_update->execute([$ordem, $tarefa_id]);
                    $ordem++;
                }
                $pdo->commit();
            } catch (Exception $e) {
                $pdo->rollBack();
                error_log("Erro ao reordenar tarefas após alternar status: " . $e->getMessage());
                returnError('Erro ao reordenar tarefas após alternar status.', 500);
            }

            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            error_log("Erro ao alternar status da tarefa: " . $e->getMessage());
            returnError('Erro ao alternar status da tarefa.', 500);
        }
        break;

    case 'reorder':
        // Atualizar a ordem de apresentação das tarefas pendentes e concluídas de forma única
        $data = json_decode(file_get_contents('php://input'), true);
        $pendingIds = $data['ids'] ?? [];

        // Verificar se 'ids' é um array e não está vazio
        if (!is_array($pendingIds) || empty($pendingIds)) {
            returnError('Dados de ordem inválidos.', 400);
        }

        try {
            // Verificar se todos os IDs existem e são tarefas pendentes
            $placeholders = rtrim(str_repeat('?,', count($pendingIds)), ',');
            $stmt = $pdo->prepare("SELECT id FROM tarefas WHERE id IN ($placeholders) AND concluida = FALSE");
            $stmt->execute($pendingIds);
            $existingPendingIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

            // Identificar IDs que não existem ou são concluídas
            $invalidIds = array_diff($pendingIds, $existingPendingIds);
            if (!empty($invalidIds)) {
                returnError('Alguns IDs de tarefas pendentes não foram encontrados: ' . implode(', ', $invalidIds), 400);
            }

            // Obter todas as tarefas concluídas ordenadas por 'ordem_apresentacao' ASC
            $stmt = $pdo->prepare('SELECT id FROM tarefas WHERE concluida = TRUE ORDER BY ordem_apresentacao ASC');
            $stmt->execute();
            $completedIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

            // Combinar as tarefas: pendentes na nova ordem + concluídas na ordem existente
            $allOrderedIds = array_merge($pendingIds, $completedIds);

            // Iniciar transação para garantir atomicidade
            $pdo->beginTransaction();
            try {
                $ordem = 1;
                foreach ($allOrderedIds as $id) {
                    $stmt_update = $pdo->prepare('UPDATE tarefas SET ordem_apresentacao = ? WHERE id = ?');
                    $stmt_update->execute([$ordem, $id]);
                    $ordem++;
                }
                $pdo->commit();
                echo json_encode(['success' => true]);
            } catch (Exception $e) {
                $pdo->rollBack();
                error_log("Erro na transação de reorder: " . $e->getMessage());
                returnError('Erro ao atualizar a ordem das tarefas: ' . $e->getMessage(), 500);
            }
        } catch (Exception $e) {
            error_log("Erro ao processar reorder: " . $e->getMessage());
            returnError('Erro ao processar reorder das tarefas: ' . $e->getMessage(), 500);
        }
        break;

    default:
        // Ação inválida
        returnError('Ação inválida.', 400);
        break;
}

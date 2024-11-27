<?php
header('Content-Type: application/json');

require 'config.php';

function returnError($message = 'Ocorreu um erro.', $code = 400)
{
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit();
}

$action = $_GET['action'] ?? '';

// Função para sanitizar entradas
function sanitizeInput($input)
{
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

// Função para validar o formato de uma data
function isValidDate($date)
{
    $format = 'Y-m-d';
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) === $date;
}

switch ($action) {
    case 'list':
        try {
            // Obter tarefas pendentes
            $stmt = $pdo->prepare('SELECT id, nome, custo, data_limite, ordem_apresentacao FROM tarefas ORDER BY ordem_apresentacao ASC');
            $stmt->execute();
            $tarefas_pendentes = array_map(function ($tarefa) {
                return array_filter([
                    'id' => (int)$tarefa['id'],
                    'nome' => htmlspecialchars($tarefa['nome'], ENT_QUOTES, 'UTF-8'),
                    'custo' => $tarefa['custo'] !== null ? (float)$tarefa['custo'] : null,
                    'data_limite' => $tarefa['data_limite'] !== null ? htmlspecialchars($tarefa['data_limite'], ENT_QUOTES, 'UTF-8') : null,
                    'ordem_apresentacao' => (int)$tarefa['ordem_apresentacao']
                ], fn($value) => $value !== null); // Remove campos nulos
            }, $stmt->fetchAll(PDO::FETCH_ASSOC));

            // Obter tarefas concluídas
            $stmt = $pdo->prepare('SELECT id, nome, custo, data_limite, ordem_apresentacao FROM tarefas_concluidas ORDER BY ordem_apresentacao ASC');
            $stmt->execute();
            $tarefas_concluidas = array_map(function ($tarefa) {
                return array_filter([
                    'id' => (int)$tarefa['id'],
                    'nome' => htmlspecialchars($tarefa['nome'], ENT_QUOTES, 'UTF-8'),
                    'custo' => $tarefa['custo'] !== null ? (float)$tarefa['custo'] : null,
                    'data_limite' => $tarefa['data_limite'] !== null ? htmlspecialchars($tarefa['data_limite'], ENT_QUOTES, 'UTF-8') : null,
                    'ordem_apresentacao' => (int)$tarefa['ordem_apresentacao']
                ], fn($value) => $value !== null); // Remove campos nulos
            }, $stmt->fetchAll(PDO::FETCH_ASSOC));

            $result = [
                'pendentes' => $tarefas_pendentes,
                'concluidas' => $tarefas_concluidas
            ];

            echo json_encode($result);
        } catch (Exception $e) {
            error_log("Erro ao listar tarefas: " . $e->getMessage());
            returnError('Erro ao listar tarefas.', 500);
        }
        break;


    case 'add':
        $data = json_decode(file_get_contents('php://input'), true);
        $nome = sanitizeInput($data['nome'] ?? '');
        $custo = floatval($data['custo'] ?? 0);
        $data_limite = sanitizeInput($data['data_limite'] ?? null);

        if (empty($nome)) {
            returnError('O nome da tarefa é obrigatório.', 400);
        }
        if (strlen($nome) > 255) {
            returnError('O nome da tarefa não pode exceder 255 caracteres.', 400);
        }
        if ($custo < 0) {
            returnError('O custo deve ser um valor positivo.', 400);
        }
        if ($data_limite && !isValidDate($data_limite)) {
            returnError('A data limite fornecida é inválida.', 400);
        }

        try {
            // Verificar duplicação de nome na tabela 'tarefas'
            $stmt = $pdo->prepare('SELECT COUNT(*) FROM tarefas WHERE LOWER(nome) = LOWER(?)');
            $stmt->execute([$nome]);
            if ($stmt->fetchColumn() > 0) {
                returnError('Já existe uma tarefa pendente com esse nome.', 400);
            }

            // Obter a próxima ordem de apresentação
            $stmt = $pdo->prepare('SELECT COALESCE(MAX(ordem_apresentacao), 0) + 1 FROM tarefas');
            $stmt->execute();
            $ordem = intval($stmt->fetchColumn());

            // Inserir a nova tarefa na tabela 'tarefas'
            $stmt = $pdo->prepare('INSERT INTO tarefas (nome, custo, data_limite, ordem_apresentacao) VALUES (?, ?, ?, ?)');
            $stmt->execute([$nome, $custo, $data_limite, $ordem]);

            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            error_log("Erro ao adicionar tarefa: " . $e->getMessage());
            returnError('Erro ao adicionar tarefa.', 500);
        }
        break;

    case 'update':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = intval($data['id'] ?? 0);
        $nome = sanitizeInput($data['nome'] ?? '');
        $custo = floatval($data['custo'] ?? 0);
        $data_limite = sanitizeInput($data['data_limite'] ?? null);

        if ($id <= 0) {
            returnError('ID da tarefa inválido.', 400);
        }
        if (empty($nome)) {
            returnError('O nome da tarefa é obrigatório.', 400);
        }
        if (strlen($nome) > 255) {
            returnError('O nome da tarefa não pode exceder 255 caracteres.', 400);
        }
        if ($custo < 0) {
            returnError('O custo deve ser um valor positivo.', 400);
        }
        if ($data_limite && !isValidDate($data_limite)) {
            returnError('A data limite fornecida é inválida.', 400);
        }

        try {
            // Verificar se a tarefa existe na tabela 'tarefas'
            $stmt = $pdo->prepare('SELECT COUNT(*) FROM tarefas WHERE id = ?');
            $stmt->execute([$id]);
            if ($stmt->fetchColumn() == 0) {
                returnError('Tarefa pendente não encontrada.', 404);
            }

            // Verificar duplicação de nome na tabela 'tarefas', excluindo a tarefa atual
            $stmt = $pdo->prepare('SELECT COUNT(*) FROM tarefas WHERE LOWER(nome) = LOWER(?) AND id != ?');
            $stmt->execute([$nome, $id]);
            if ($stmt->fetchColumn() > 0) {
                returnError('Já existe uma tarefa pendente com esse nome.', 400);
            }

            // Atualizar a tarefa na tabela 'tarefas'
            $stmt = $pdo->prepare('UPDATE tarefas SET nome = ?, custo = ?, data_limite = ? WHERE id = ?');
            $stmt->execute([$nome, $custo, $data_limite, $id]);

            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            error_log("Erro ao atualizar tarefa: " . $e->getMessage());
            returnError('Erro ao atualizar tarefa.', 500);
        }
        break;

    case 'delete':
        // Excluir tarefa
        $data = json_decode(file_get_contents('php://input'), true);
        $id = intval($data['id'] ?? 0);

        if ($id <= 0) {
            returnError('ID da tarefa inválido.', 400);
        }

        try {
            // Verificar se a tarefa existe na tabela 'tarefas'
            $stmt = $pdo->prepare('SELECT concluida FROM tarefas WHERE id = ?');
            $stmt->execute([$id]);
            $tarefa = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($tarefa) {
                // Excluir da tabela 'tarefas'
                $stmt = $pdo->prepare('DELETE FROM tarefas WHERE id = ?');
                $stmt->execute([$id]);

                // Reordenar as tarefas pendentes para manter a sequência
                $stmt = $pdo->prepare('SELECT id FROM tarefas ORDER BY ordem_apresentacao ASC');
                $stmt->execute();
                $tarefas_pendentes = $stmt->fetchAll(PDO::FETCH_COLUMN);

                // Iniciar transação
                $pdo->beginTransaction();
                try {
                    $ordem = 1;
                    foreach ($tarefas_pendentes as $tarefa_id) {
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
                exit();
            }

            // Verificar se a tarefa existe na tabela 'tarefas_concluidas'
            $stmt = $pdo->prepare('SELECT COUNT(*) FROM tarefas_concluidas WHERE id = ?');
            $stmt->execute([$id]);
            $tarefa_concluida = $stmt->fetchColumn();

            if ($tarefa_concluida > 0) {
                // Excluir da tabela 'tarefas_concluidas'
                $stmt = $pdo->prepare('DELETE FROM tarefas_concluidas WHERE id = ?');
                $stmt->execute([$id]);

                // Reordenar as tarefas concluídas para manter a sequência
                $stmt = $pdo->prepare('SELECT id FROM tarefas_concluidas ORDER BY ordem_apresentacao ASC');
                $stmt->execute();
                $tarefas_concluidas = $stmt->fetchAll(PDO::FETCH_COLUMN);

                // Iniciar transação
                $pdo->beginTransaction();
                try {
                    $ordem = 1;
                    foreach ($tarefas_concluidas as $tarefa_id) {
                        $stmt_update = $pdo->prepare('UPDATE tarefas_concluidas SET ordem_apresentacao = ? WHERE id = ?');
                        $stmt_update->execute([$ordem, $tarefa_id]);
                        $ordem++;
                    }
                    $pdo->commit();
                } catch (Exception $e) {
                    $pdo->rollBack();
                    error_log("Erro ao reordenar tarefas concluídas após exclusão: " . $e->getMessage());
                    returnError('Erro ao reordenar tarefas concluídas após exclusão.', 500);
                }

                echo json_encode(['success' => true]);
                exit();
            }

            // Se a tarefa não foi encontrada em nenhuma tabela
            returnError('Tarefa não encontrada em nenhuma tabela.', 404);
        } catch (Exception $e) {
            error_log("Erro ao excluir tarefa: " . $e->getMessage());
            returnError('Erro ao excluir tarefa.', 500);
        }
        break;

    case 'toggle':
        // Alternar o status de conclusão da tarefa entre 'tarefas' e 'tarefas_concluidas'
        $data = json_decode(file_get_contents('php://input'), true);
        $id = intval($data['id'] ?? 0);
        $concluida = isset($data['concluida']) ? boolval($data['concluida']) : false;

        if ($id <= 0) {
            returnError('ID da tarefa inválido.', 400);
        }

        try {
            if ($concluida) {
                // Marcar como concluída: mover de 'tarefas' para 'tarefas_concluidas'
                // Obter os detalhes da tarefa pendente
                $stmt = $pdo->prepare('SELECT nome, custo, data_limite, ordem_apresentacao FROM tarefas WHERE id = ?');
                $stmt->execute([$id]);
                $tarefa = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$tarefa) {
                    returnError('Tarefa pendente não encontrada.', 404);
                }

                // Iniciar transação
                $pdo->beginTransaction();
                try {
                    // Inserir na tabela 'tarefas_concluidas'
                    $stmt = $pdo->prepare('INSERT INTO tarefas_concluidas (nome, custo, data_limite, ordem_apresentacao) VALUES (?, ?, ?, ?)');
                    $stmt->execute([$tarefa['nome'], $tarefa['custo'], $tarefa['data_limite'], $tarefa['ordem_apresentacao']]);

                    // Remover da tabela 'tarefas'
                    $stmt = $pdo->prepare('DELETE FROM tarefas WHERE id = ?');
                    $stmt->execute([$id]);

                    $pdo->commit();
                    echo json_encode(['success' => true]);
                } catch (Exception $e) {
                    $pdo->rollBack();
                    error_log("Erro ao marcar tarefa como concluída: " . $e->getMessage());
                    returnError('Erro ao marcar tarefa como concluída.', 500);
                }
            } else {
                // Marcar como pendente: mover de 'tarefas_concluidas' para 'tarefas'
                // Obter os detalhes da tarefa concluída
                $stmt = $pdo->prepare('SELECT nome, custo, data_limite, ordem_apresentacao FROM tarefas_concluidas WHERE id = ?');
                $stmt->execute([$id]);
                $tarefa = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$tarefa) {
                    returnError('Tarefa concluída não encontrada.', 404);
                }

                // Verificar se já existe uma tarefa pendente com o mesmo nome
                $stmt = $pdo->prepare('SELECT COUNT(*) FROM tarefas WHERE LOWER(nome) = LOWER(?)');
                $stmt->execute([$tarefa['nome']]);
                if ($stmt->fetchColumn() > 0) {
                    returnError('Já existe uma tarefa pendente com esse nome. Não é possível mover a tarefa de volta.', 400);
                }

                // Iniciar transação
                $pdo->beginTransaction();
                try {
                    // Obter a próxima ordem de apresentação na tabela `tarefas`
                    $stmt = $pdo->prepare('SELECT COALESCE(MAX(ordem_apresentacao), 0) + 1 FROM tarefas');
                    $stmt->execute();
                    $ordem = intval($stmt->fetchColumn());

                    // Inserir na tabela `tarefas`
                    $stmt = $pdo->prepare('INSERT INTO tarefas (nome, custo, data_limite, ordem_apresentacao) VALUES (?, ?, ?, ?)');
                    $stmt->execute([$tarefa['nome'], $tarefa['custo'], $tarefa['data_limite'], $ordem]);

                    // Remover da tabela `tarefas_concluidas`
                    $stmt = $pdo->prepare('DELETE FROM tarefas_concluidas WHERE id = ?');
                    $stmt->execute([$id]);

                    $pdo->commit();
                    echo json_encode(['success' => true]);
                } catch (Exception $e) {
                    $pdo->rollBack();
                    error_log("Erro ao mover tarefa para pendentes: " . $e->getMessage());
                    returnError('Erro ao mover tarefa para pendentes.', 500);
                }
            }
        } catch (Exception $e) {
            error_log("Erro ao alternar status da tarefa: " . $e->getMessage());
            returnError('Erro ao alternar status da tarefa.', 500);
        }
        break;

    case 'reorder':
        // Atualizar a ordem de apresentação das tarefas pendentes de forma única
        $data = json_decode(file_get_contents('php://input'), true);
        $pendingIds = $data['ids'] ?? [];

        // Verificar se 'ids' é um array e não está vazio
        if (!is_array($pendingIds) || empty($pendingIds)) {
            returnError('Dados de ordem inválidos.', 400);
        }

        try {
            // Verificar se todos os IDs existem e são tarefas pendentes
            $placeholders = rtrim(str_repeat('?,', count($pendingIds)), ',');
            $stmt = $pdo->prepare("SELECT id FROM tarefas WHERE id IN ($placeholders)");
            $stmt->execute($pendingIds);
            $existingPendingIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

            // Identificar IDs que não existem ou não são pendentes
            $invalidIds = array_diff($pendingIds, $existingPendingIds);
            if (!empty($invalidIds)) {
                returnError('Alguns IDs de tarefas pendentes não foram encontrados: ' . implode(', ', $invalidIds), 400);
            }

            // Obter todas as tarefas concluídas ordenadas por 'ordem_apresentacao' ASC
            $stmt = $pdo->prepare('SELECT id FROM tarefas_concluidas ORDER BY ordem_apresentacao ASC');
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

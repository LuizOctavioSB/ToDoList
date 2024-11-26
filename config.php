<?php
$host = 'localhost';
$port = '3306';
$dbname = 'fatto';
$user = 'user';
$password = '123';

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    error_log('Conexão falhou: ' . $e->getMessage());
    echo json_encode(['error' => 'Erro ao conectar ao banco de dados.']);
    exit();
}

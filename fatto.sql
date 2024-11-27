-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 27/11/2024 às 15:10
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `fatto`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `tarefas`
--

CREATE TABLE `tarefas` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `custo` decimal(10,2) DEFAULT 0.00,
  `data_limite` date DEFAULT NULL,
  `ordem_apresentacao` int(11) NOT NULL,
  `concluida` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `tarefas`
--

INSERT INTO `tarefas` (`id`, `nome`, `custo`, `data_limite`, `ordem_apresentacao`, `concluida`) VALUES
(1, 'Tarefa 1', 500.00, '2024-12-31', 1, 0);

-- --------------------------------------------------------

--
-- Estrutura para tabela `tarefas_concluidas`
--

CREATE TABLE `tarefas_concluidas` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `custo` decimal(10,2) DEFAULT 0.00,
  `data_limite` date DEFAULT NULL,
  `ordem_apresentacao` int(11) NOT NULL,
  `concluida` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `tarefas_concluidas`
--

INSERT INTO `tarefas_concluidas` (`id`, `nome`, `custo`, `data_limite`, `ordem_apresentacao`, `concluida`) VALUES
(1, 'Tarefa 2', 1500.00, '2024-11-30', 3, 1),
(2, 'Tarefa 3', 750.50, NULL, 2, 1),
(3, 'Tarefa 2', 0.00, NULL, 1, 1),
(4, 'Tarefa 2', 0.00, NULL, 2, 1);

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `tarefas`
--
ALTER TABLE `tarefas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nome` (`nome`),
  ADD UNIQUE KEY `nome_2` (`nome`);

--
-- Índices de tabela `tarefas_concluidas`
--
ALTER TABLE `tarefas_concluidas`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `tarefas`
--
ALTER TABLE `tarefas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `tarefas_concluidas`
--
ALTER TABLE `tarefas_concluidas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

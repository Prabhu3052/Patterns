-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 27, 2025 at 09:50 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `estimation`
--

-- --------------------------------------------------------

--
-- Table structure for table `counter`
--

CREATE TABLE `counter` (
  `id` int(11) NOT NULL,
  `last_estimation_number` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `counter`
--

INSERT INTO `counter` (`id`, `last_estimation_number`) VALUES
(1, 'E14');

-- --------------------------------------------------------

--
-- Table structure for table `estimations`
--

CREATE TABLE `estimations` (
  `estimation_number` varchar(20) NOT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `discount` decimal(10,2) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `is_marked` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `estimations`
--

INSERT INTO `estimations` (`estimation_number`, `customer_name`, `phone_number`, `discount`, `total_amount`, `is_marked`, `created_at`) VALUES
('E1', 'Prabhu', '1234567890', 10.00, 243.00, 0, '2025-08-27 18:09:59'),
('E10', 'Joker', '2222', 20.00, 136.00, 0, '2025-08-27 19:23:46'),
('E11', 'Joker', '1234567890', 12.00, 198.00, 0, '2025-08-27 19:31:07'),
('E12', 'Joker', '1234567890', 12.00, 2420.00, 0, '2025-08-27 19:35:05'),
('E13', 'Joker', '1234567890', 12.00, 220.00, 0, '2025-08-27 19:47:34'),
('E14', 'Joker', '1234567890', 12.00, 1100.00, 0, '2025-08-27 19:49:18'),
('E2', 'Tamil', '1234567890', 0.00, 135.00, 0, '2025-08-27 18:23:12'),
('E3', 'Joker', '00000000000', 50.00, 1620.00, 0, '2025-08-27 18:28:27'),
('E4', 'English', '1234567890', 10.00, 9000.00, 0, '2025-08-27 18:34:27'),
('E5', 'Joker', '3333333333', 30.00, 91000.00, 0, '2025-08-27 18:41:27'),
('E6', 'Joker', '1234567890', 0.00, 1000.00, 0, '2025-08-27 18:42:09'),
('E7', 'Joker', '38483479343', 30.00, 1547.00, 0, '2025-08-27 18:57:56'),
('E8', 'Joker', '3333333', 20.00, 106665.60, 0, '2025-08-27 19:01:21'),
('E9', 'Joker', '2222', 20.00, 136.00, 0, '2025-08-27 19:22:24');

-- --------------------------------------------------------

--
-- Table structure for table `estimation_items`
--

CREATE TABLE `estimation_items` (
  `id` int(11) NOT NULL,
  `estimation_number` varchar(20) DEFAULT NULL,
  `product_id` varchar(20) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `estimation_items`
--

INSERT INTO `estimation_items` (`id`, `estimation_number`, `product_id`, `quantity`) VALUES
(1, 'E1', 'P003', 1),
(2, 'E2', 'P002', 1),
(3, 'E3', 'P003', 12),
(4, 'E4', 'P007', 1),
(5, 'E5', 'P007', 13),
(6, 'E6', 'P006', 1),
(7, 'E7', 'P001', 13),
(8, 'E8', 'P010', 12),
(9, 'E9', 'P001', 1),
(10, 'E10', 'P001', 1),
(11, 'E11', 'P005', 1),
(12, 'E12', 'P005', 11),
(13, 'E13', 'P005', 1),
(14, 'E14', 'P005', 1),
(15, 'E14', 'P009', 1);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `tamil_name` varchar(100) DEFAULT NULL,
  `original_price` decimal(10,2) NOT NULL,
  `offer_price` decimal(10,2) DEFAULT NULL,
  `category` varchar(100) NOT NULL,
  `in_stock` tinyint(1) DEFAULT 0,
  `content` varchar(100) DEFAULT NULL,
  `image` varchar(1000) DEFAULT 'image.jpg',
  `video` varchar(100) DEFAULT NULL,
  `instagram` varchar(100) DEFAULT NULL,
  `last_updated` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `name`, `tamil_name`, `original_price`, `offer_price`, `category`, `in_stock`, `content`, `image`, `video`, `instagram`, `last_updated`) VALUES
('P001', 'Flower Pot Deluxe', 'Flower Pot Deluxe', 200.00, 170.00, 'Day Time Crackers', 0, '1PKT', 'image.jpg', 'https://www.youtube.com/////', 'https://www.instagram.com////', '2025-08-27 17:38:13'),
('P002', 'Sparkler Star', 'பொறி நட்சத்திரம்', 150.00, 135.00, 'Night Time Crackers', 0, '1PKT', 'image.jpg', 'https://www.youtube.com/watch?v=fw2', 'https://www.instagram.com/p/fw2/', '2025-08-27 22:18:27'),
('P003', 'Crackle Bomb', 'வெடி குண்டு', 300.00, 270.00, 'Aerial Fireworks', 0, '1PKT', 'image.jpg', 'https://www.youtube.com/watch?v=fw3', 'https://www.instagram.com/p/fw3/', '2025-08-27 22:18:27'),
('P004', 'Pop-Pops', 'பாப்-பாப்ஸ்', 50.00, 45.00, 'NewKids Crackers', 0, '1PKT', 'image.jpg', 'https://www.youtube.com/watch?v=fw4', 'https://www.instagram.com/p/fw4/', '2025-08-27 17:43:08'),
('P005', 'Rainbow Fountain', 'வானவில் நீரூற்று', 250.00, 250.00, 'Fancy Crackers', 0, '1PKT', 'image.jpg', 'https://www.youtube.com/watch?v=fw5', 'https://www.instagram.com/p/fw5/', '2025-08-27 19:32:25'),
('P006', 'Sample Cracker', 'Sample Cracker', 1000.00, 1000.00, 'Aerial Fireworks', 1, '1PKT', 'image.jpg', 'https://www.youtube.com/watch?v=undefined', 'https://www.instagram.com/product_link', '2025-08-27 17:47:25'),
('P007', '1wala', '1', 10000.00, 10000.00, '0', 1, '1PKT', 'image.jpg', 'https://www.youtube.com/', 'https://www.instagram.com/', '2025-08-27 17:22:11'),
('P008', '2wala', 'fsdffs', 2000.00, 2000.00, '0', 0, '1PKT', 'image.jpg', 'https://www.youtube.com/', 'https://www.instagram.com/', '2025-08-27 17:32:00'),
('P009', '3wala', '3', 1000.00, 1000.00, '0', 0, '1PKT', 'image.jpg', 'https://www.youtube.com/', 'https://www.instagram.com/', '2025-08-27 17:32:50'),
('P010', '11111', '11111', 11111.00, 11111.00, '0', 0, '1PKT', 'image.jpg', 'https://www.youtube.com/', 'https://www.instagram.com/', '2025-08-27 17:38:32'),
('P011', '22222222', '22222222', 2222222.00, 2222222.00, '0', 0, '1PKT', 'image.jpg', 'https://www.youtube.com/', 'https://www.instagram.com/', '2025-08-27 17:44:56');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `counter`
--
ALTER TABLE `counter`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `estimations`
--
ALTER TABLE `estimations`
  ADD PRIMARY KEY (`estimation_number`);

--
-- Indexes for table `estimation_items`
--
ALTER TABLE `estimation_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `estimation_number` (`estimation_number`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `estimation_items`
--
ALTER TABLE `estimation_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `estimation_items`
--
ALTER TABLE `estimation_items`
  ADD CONSTRAINT `estimation_items_ibfk_1` FOREIGN KEY (`estimation_number`) REFERENCES `estimations` (`estimation_number`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

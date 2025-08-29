-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 29, 2025 at 06:12 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kkc-is`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

CREATE TABLE `accounts` (
  `account_id` int(11) NOT NULL,
  `warehouse_id` int(11) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(150) NOT NULL,
  `role` varchar(150) NOT NULL,
  `added_at` datetime NOT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `accounts`
--

INSERT INTO `accounts` (`account_id`, `warehouse_id`, `fullname`, `username`, `email`, `password`, `role`, `added_at`, `updated_at`) VALUES
(3, 1, 'Xenia Angelica Velacruz', 'Xenia', 'xeniaangelicavelacruz@gmail.com', '$2b$10$YB0EevQmUEoC3ZKcfNJfRO9sm98dMSvaUHOnfAk.JvnobNBrI4FBy', 'Admin', '2025-08-29 12:49:49', '2025-08-29 13:42:39'),
(4, 2, 'John Erwin Sayno Albos', 'Janjan', 'johnerwinalbos@gmail.com', '$2b$10$R3lGGeLlp2qzp.z1vtkYr.7d9s7IWt3wzQIA3ilQxadKYfBbzQapS', 'Admin', '2025-08-29 17:53:13', '2025-08-29 13:42:39'),
(6, 6, 'Test', 'Testing', 'test@gmali.com', '$2b$10$NaoRBCWVWei4A4Y5sResoOre9WsVh7VhOBd63pF.oIjPDQ/GrITcW', 'Warehouse', '2025-08-29 21:04:57', '2025-08-29 13:56:27');

-- --------------------------------------------------------

--
-- Table structure for table `basic_information`
--

CREATE TABLE `basic_information` (
  `basic_info_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `fname` varchar(150) NOT NULL,
  `mname` varchar(150) NOT NULL,
  `lname` varchar(150) NOT NULL,
  `ext` varchar(100) NOT NULL,
  `gender` varchar(100) NOT NULL,
  `bdate` date NOT NULL,
  `phoneNumber` varchar(100) NOT NULL,
  `address` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` int(11) NOT NULL,
  `sku` varchar(50) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `supplier_id` int(11) DEFAULT NULL,
  `cost_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `selling_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stock_status` enum('In Stock','Low Stock','Out of Stock') NOT NULL DEFAULT 'Out of Stock',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `sku`, `product_name`, `description`, `unit`, `stock`, `supplier_id`, `cost_price`, `selling_price`, `stock_status`, `created_at`, `updated_at`) VALUES
(1, '1000000001', 'Tubullar', '1/2 pls', 'pcs', 200, 2, 5.50, 10.00, 'In Stock', '2025-08-24 07:17:28', '2025-08-24 11:12:31'),
(2, '1000000002', 'Ladder', '20 m', 'pcs', 6, 3, 180.00, 250.00, 'Low Stock', '2025-08-24 07:17:28', '2025-08-24 12:28:24'),
(5, '1000000005', 'U Bolt', '2 1/2\"', 'pcs', 0, 1, 22.00, 40.00, 'Out of Stock', '2025-08-24 07:17:28', '2025-08-24 12:28:47'),
(7, '3973077526', 'Hello', 'XD', 'rtg', 1, 1, 3434.00, 34242.00, 'Low Stock', '2025-08-24 08:30:12', '2025-08-24 12:28:38'),
(9, '5875003189', 'Bulb', 'wew', 'pcs', 20, 3, 232.00, 2344.00, 'In Stock', '2025-08-24 11:59:21', '2025-08-24 11:59:21'),
(10, '3749050401', 'asd', 'wwwwww', 'asd', 4, 1, 123.00, 123.00, 'Low Stock', '2025-08-24 12:20:47', '2025-08-24 13:04:29'),
(11, '5371260819', 'XD', 'ito', 'pcs', 34, 2, 23.00, 2312.00, 'In Stock', '2025-08-24 12:22:20', '2025-08-24 12:22:20'),
(12, '9742352168', 'Pisoooooo', 'hatdog', 'pcs', 2, 3, 23.00, 25.00, 'Low Stock', '2025-08-24 12:30:59', '2025-08-24 12:32:49'),
(13, '1000000003', 'pillows', 'asf', 'pcs', 120, 2, 15.00, 10.00, 'In Stock', '2025-08-28 13:32:10', '2025-08-28 13:32:10'),
(14, '0220225541', 'asf', 'asf', 'pc', 20, 1, 1500.00, 50.00, 'In Stock', '2025-08-28 13:32:49', '2025-08-28 13:32:49');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `supplier_id` int(11) NOT NULL,
  `supplier_name` varchar(100) NOT NULL,
  `contact_name` varchar(100) DEFAULT NULL,
  `contact_number` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`supplier_id`, `supplier_name`, `contact_name`, `contact_number`) VALUES
(1, 'IT Supply', 'Maria Santos', '09171234567'),
(2, 'Beta Distributors', 'Juan Dela Cruz', '09998887777'),
(3, 'Electronic Supply', 'Liza Reyes', '09051239876');

-- --------------------------------------------------------

--
-- Table structure for table `warehouse`
--

CREATE TABLE `warehouse` (
  `warehouse_id` int(11) NOT NULL,
  `warehouse_name` varchar(255) NOT NULL,
  `location` varchar(500) NOT NULL,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `warehouse`
--

INSERT INTO `warehouse` (`warehouse_id`, `warehouse_name`, `location`, `added_at`) VALUES
(1, 'Makati Warehouse', 'Makati', '2025-08-29 04:48:30'),
(2, 'Quezon Warehouse', 'Quezon', '2025-08-29 04:48:39'),
(3, 'Manila Warehouse', 'Manila', '2025-08-29 04:48:51'),
(5, 'Labo Warehouse', 'Labo', '2025-08-29 08:18:36'),
(6, 'Daet Warehouse', 'Daet', '2025-08-29 10:30:55'),
(8, 'Basud Warehouse', 'Basud', '2025-08-29 11:35:45'),
(9, 'Talisay Warehouse', 'Talisay', '2025-08-29 15:39:19');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`account_id`),
  ADD KEY `warehouse_id` (`warehouse_id`);

--
-- Indexes for table `basic_information`
--
ALTER TABLE `basic_information`
  ADD PRIMARY KEY (`basic_info_id`),
  ADD KEY `account_id` (`account_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `fk_products_supplier` (`supplier_id`),
  ADD KEY `idx_products_search` (`product_name`,`sku`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`supplier_id`);

--
-- Indexes for table `warehouse`
--
ALTER TABLE `warehouse`
  ADD PRIMARY KEY (`warehouse_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accounts`
--
ALTER TABLE `accounts`
  MODIFY `account_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `basic_information`
--
ALTER TABLE `basic_information`
  MODIFY `basic_info_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `supplier_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `warehouse`
--
ALTER TABLE `warehouse`
  MODIFY `warehouse_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `accounts`
--
ALTER TABLE `accounts`
  ADD CONSTRAINT `warehouse_id` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse` (`warehouse_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `basic_information`
--
ALTER TABLE `basic_information`
  ADD CONSTRAINT `account_id` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

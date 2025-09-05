-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 05, 2025 at 07:01 PM
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
(7, '3973077526', 'Hello', 'XD', 'rtg', 21, 1, 3434.00, 34242.00, 'In Stock', '2025-08-24 08:30:12', '2025-08-30 15:43:58'),
(9, '5875003189', 'Bulb', 'wew', 'pcs', 30, 3, 232.00, 2344.00, 'In Stock', '2025-08-24 11:59:21', '2025-09-04 12:22:42'),
(10, '3749050401', 'asd', 'wwwwww', 'asd', 4, 1, 123.00, 123.00, 'Low Stock', '2025-08-24 12:20:47', '2025-08-24 13:04:29'),
(11, '5371260819', 'XD', 'ito', 'pcs', 34, 2, 23.00, 2312.00, 'In Stock', '2025-08-24 12:22:20', '2025-08-24 12:22:20'),
(12, '9742352168', 'Pisoooooo', 'hatdog', 'pcs', 15, 3, 23.00, 25.00, 'In Stock', '2025-08-24 12:30:59', '2025-08-31 05:48:40'),
(13, '1000000003', 'Aluminum Ladder 6ft', 'asf', 'pcs', 124, 2, 15.00, 10.00, 'In Stock', '2025-08-28 13:32:10', '2025-08-30 15:05:02'),
(14, '0220225541', 'asf', 'asf', 'pc', 20, 1, 1500.00, 50.00, 'In Stock', '2025-08-28 13:32:49', '2025-08-28 13:32:49'),
(16, '1000000004', 'LED Bulb 9W', 'Warm white', 'pc', 150, 2, 45.00, 80.00, 'In Stock', '2025-08-30 14:44:08', '2025-08-30 14:44:08'),
(18, '9783809638', 'AAAAA', 'ELO', 'pcs', 17, 1, 120.00, 130.00, 'In Stock', '2025-08-30 15:07:24', '2025-08-30 15:40:37');

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `purchase_id` int(11) NOT NULL,
  `purchase_date` date NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `total_cost` decimal(10,2) DEFAULT 0.00,
  `purchase_status` enum('Pending','Completed') DEFAULT 'Pending',
  `purchase_payment_status` enum('Unpaid','Partially Paid','Fully Paid') DEFAULT 'Unpaid',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchases`
--

INSERT INTO `purchases` (`purchase_id`, `purchase_date`, `supplier_id`, `total_cost`, `purchase_status`, `purchase_payment_status`, `created_at`) VALUES
(2, '2025-08-30', 2, 4500.00, 'Completed', 'Fully Paid', '2025-08-30 14:44:08'),
(5, '2025-08-30', 1, 600.00, 'Completed', 'Fully Paid', '2025-08-30 15:37:55'),
(6, '2025-08-30', 1, 506.00, 'Pending', 'Unpaid', '2025-08-30 15:43:58'),
(7, '2025-08-31', 3, 299.00, 'Completed', 'Fully Paid', '2025-08-31 05:48:40'),
(8, '2025-09-04', 3, 2320.00, 'Completed', 'Partially Paid', '2025-09-04 12:22:42');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_items`
--

CREATE TABLE `purchase_items` (
  `purchase_item_id` int(11) NOT NULL,
  `purchase_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_cost` decimal(10,2) NOT NULL,
  `total_cost` decimal(10,2) NOT NULL,
  `qty_received` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchase_items`
--

INSERT INTO `purchase_items` (`purchase_item_id`, `purchase_id`, `product_id`, `quantity`, `unit_cost`, `total_cost`, `qty_received`) VALUES
(2, 2, 16, 100, 45.00, 4500.00, 100),
(5, 5, 18, 5, 120.00, 600.00, 5),
(6, 6, 7, 22, 23.00, 506.00, 20),
(7, 7, 12, 13, 23.00, 299.00, 13),
(8, 8, 9, 10, 232.00, 2320.00, 10);

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `sales_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `warehouse_id` int(11) NOT NULL,
  `sale_date` date NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `total_sale` decimal(10,2) NOT NULL,
  `delivery_status` enum('Pending','Partially','Delivered','') NOT NULL,
  `sale_payment_status` enum('Unpaid','Partial','Fully Paid','') NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`sales_id`, `account_id`, `product_id`, `warehouse_id`, `sale_date`, `customer_name`, `total_sale`, `delivery_status`, `sale_payment_status`, `created_at`, `updated_at`) VALUES
(4, 4, 1, 1, '2025-09-05', 'Juan Dela Cruz', 100.00, 'Pending', 'Unpaid', '2025-09-05 15:36:23', '2025-09-05 15:36:23'),
(5, 4, 12, 6, '2025-09-11', 'asf', 123.00, 'Pending', 'Partial', '2025-09-05 16:59:27', '2025-09-05 16:59:27');

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `stock_movement_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `warehouse_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `movement_type` enum('purchase','sale','purchase_return','sales_return') NOT NULL,
  `purchase_id` int(11) DEFAULT NULL,
  `sale_id` int(11) DEFAULT NULL,
  `purchase_returns` int(11) DEFAULT NULL,
  `sales_returns` int(11) DEFAULT NULL,
  `movement_date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stock_movements`
--

INSERT INTO `stock_movements` (`stock_movement_id`, `product_id`, `warehouse_id`, `quantity`, `movement_type`, `purchase_id`, `sale_id`, `purchase_returns`, `sales_returns`, `movement_date`) VALUES
(1, 13, NULL, 3, 'purchase', 1, NULL, NULL, NULL, '2025-08-30 22:44:08'),
(2, 16, NULL, 100, 'purchase', 2, NULL, NULL, NULL, '2025-08-30 22:44:08'),
(3, 13, NULL, 1, 'purchase', 1, NULL, NULL, NULL, '2025-08-30 23:05:02'),
(4, 18, NULL, 1, 'purchase', 3, NULL, NULL, NULL, '2025-08-30 23:09:33'),
(5, 18, NULL, 4, 'purchase', 4, NULL, NULL, NULL, '2025-08-30 23:35:45'),
(6, 18, NULL, 4, 'purchase', 5, NULL, NULL, NULL, '2025-08-30 23:37:55'),
(7, 18, NULL, 1, 'purchase', 5, NULL, NULL, NULL, '2025-08-30 23:40:37'),
(8, 7, NULL, 20, 'purchase', 6, NULL, NULL, NULL, '2025-08-30 23:43:58'),
(9, 12, NULL, 13, 'purchase', 7, NULL, NULL, NULL, '2025-08-31 13:48:40'),
(10, 9, NULL, 10, 'purchase', 8, NULL, NULL, NULL, '2025-09-04 20:22:42');

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
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`purchase_id`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Indexes for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD PRIMARY KEY (`purchase_item_id`),
  ADD KEY `purchase_id` (`purchase_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`sales_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `fk_account_id` (`account_id`),
  ADD KEY `fk_warehouse_id` (`warehouse_id`);

--
-- Indexes for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`stock_movement_id`),
  ADD KEY `product_id` (`product_id`);

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
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `purchase_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `purchase_items`
--
ALTER TABLE `purchase_items`
  MODIFY `purchase_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `sales_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `stock_movement_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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

--
-- Constraints for table `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`);

--
-- Constraints for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD CONSTRAINT `purchase_items_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`purchase_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Constraints for table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `fk_account_id` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_warehouse_id` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse` (`warehouse_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

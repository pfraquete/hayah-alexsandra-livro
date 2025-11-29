CREATE TABLE `addresses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`recipientName` varchar(255) NOT NULL,
	`cep` varchar(10) NOT NULL,
	`street` varchar(255) NOT NULL,
	`number` varchar(20) NOT NULL,
	`complement` varchar(100),
	`district` varchar(100) NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(2) NOT NULL,
	`isDefault` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `addresses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPriceCents` int NOT NULL,
	`totalPriceCents` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`addressId` int,
	`subtotalCents` int NOT NULL,
	`shippingPriceCents` int NOT NULL,
	`discountCents` int NOT NULL DEFAULT 0,
	`totalCents` int NOT NULL,
	`status` enum('AGUARDANDO_PAGAMENTO','PAGO','EM_SEPARACAO','POSTADO','EM_TRANSITO','ENTREGUE','CANCELADO','REEMBOLSADO') NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO',
	`paymentMethod` varchar(50),
	`shippingAddress` json,
	`customerNotes` text,
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`paidAt` timestamp,
	`shippedAt` timestamp,
	`deliveredAt` timestamp,
	`cancelledAt` timestamp,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paymentTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`externalId` varchar(100),
	`gateway` varchar(50) NOT NULL DEFAULT 'pagarme',
	`method` varchar(50) NOT NULL,
	`amountCents` int NOT NULL,
	`status` enum('pending','processing','authorized','paid','refunded','failed','canceled') NOT NULL DEFAULT 'pending',
	`gatewayResponse` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`priceCents` int NOT NULL,
	`compareAtPriceCents` int,
	`stockQuantity` int NOT NULL DEFAULT 0,
	`weightGrams` int NOT NULL DEFAULT 300,
	`widthCm` decimal(5,2) NOT NULL DEFAULT '14',
	`heightCm` decimal(5,2) NOT NULL DEFAULT '21',
	`depthCm` decimal(5,2) NOT NULL DEFAULT '2',
	`imageUrl` varchar(500),
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `shipments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`shippingMethod` varchar(50) NOT NULL,
	`shippingPriceCents` int NOT NULL,
	`trackingCode` varchar(50),
	`trackingUrl` varchar(500),
	`status` enum('PENDENTE','ETIQUETA_GERADA','POSTADO','EM_TRANSITO','SAIU_PARA_ENTREGA','ENTREGUE','DEVOLVIDO') NOT NULL DEFAULT 'PENDENTE',
	`labelUrl` varchar(500),
	`estimatedDeliveryDays` int,
	`postedAt` timestamp,
	`deliveredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shipments_id` PRIMARY KEY(`id`),
	CONSTRAINT `shipments_orderId_unique` UNIQUE(`orderId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `cpf` varchar(14);
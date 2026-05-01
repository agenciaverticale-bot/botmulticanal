CREATE TABLE `api_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`platform` enum('whatsapp','instagram') NOT NULL,
	`token` varchar(1024) NOT NULL,
	`secretKey` varchar(1024),
	`phoneNumberId` varchar(255),
	`businessAccountId` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `api_credentials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatbot_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`triggerKeywords` text NOT NULL,
	`responseTemplate` text NOT NULL,
	`platform` enum('whatsapp','instagram','both') NOT NULL DEFAULT 'both',
	`priority` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chatbot_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`externalId` varchar(255) NOT NULL,
	`platform` enum('whatsapp','instagram') NOT NULL,
	`name` varchar(255),
	`phoneNumber` varchar(20),
	`instagramHandle` varchar(255),
	`profilePicture` varchar(512),
	`lastInteractionAt` timestamp,
	`status` enum('active','inactive','blocked') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contactId` int NOT NULL,
	`platform` enum('whatsapp','instagram') NOT NULL,
	`externalConversationId` varchar(255),
	`subject` varchar(255),
	`status` enum('open','closed','pending') NOT NULL DEFAULT 'open',
	`unreadCount` int NOT NULL DEFAULT 0,
	`lastMessageAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`contactId` int NOT NULL,
	`userId` int NOT NULL,
	`externalMessageId` varchar(255),
	`platform` enum('whatsapp','instagram') NOT NULL,
	`direction` enum('inbound','outbound') NOT NULL,
	`messageType` enum('text','image','video','audio','document','location') NOT NULL DEFAULT 'text',
	`content` text,
	`mediaUrl` varchar(512),
	`mediaType` varchar(50),
	`status` enum('sent','delivered','read','failed') NOT NULL DEFAULT 'sent',
	`senderName` varchar(255),
	`senderPhone` varchar(20),
	`senderInstagramHandle` varchar(255),
	`llmSuggestion` text,
	`automatedResponse` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('email','in_app') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`messageId` int,
	`conversationId` int,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notification_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailNotificationsEnabled` boolean NOT NULL DEFAULT true,
	`unreadMessageThreshold` int NOT NULL DEFAULT 10,
	`notifyOnEveryMessage` boolean NOT NULL DEFAULT false,
	`notifyOnImportantKeywords` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_settings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `api_credentials` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_chatbot_rules_user_active` ON `chatbot_rules` (`userId`,`isActive`);--> statement-breakpoint
CREATE INDEX `idx_contacts_user_id` ON `contacts` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_contacts_user_platform` ON `contacts` (`userId`,`platform`);--> statement-breakpoint
CREATE INDEX `idx_conversations_user_id` ON `conversations` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_conversations_user_status` ON `conversations` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `idx_conversations_user_platform` ON `conversations` (`userId`,`platform`);--> statement-breakpoint
CREATE INDEX `idx_messages_conversation_id` ON `messages` (`conversationId`);--> statement-breakpoint
CREATE INDEX `idx_messages_user_created` ON `messages` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_notification_logs_user_type` ON `notification_logs` (`userId`,`type`);
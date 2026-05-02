CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`messageTemplate` text NOT NULL,
	`platform` enum('whatsapp','instagram','both') NOT NULL DEFAULT 'whatsapp',
	`status` enum('draft','scheduled','running','paused','completed','failed') NOT NULL DEFAULT 'draft',
	`targetAudience` text,
	`totalRecipients` int NOT NULL DEFAULT 0,
	`successfulSends` int NOT NULL DEFAULT 0,
	`failedSends` int NOT NULL DEFAULT 0,
	`scheduledAt` timestamp,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
CREATE INDEX `idx_campaigns_user_id` ON `campaigns` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_campaigns_status` ON `campaigns` (`status`);
CREATE TABLE `reset_token` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`token_hash` text NOT NULL,
	`expire_at` timestamp DEFAULT (CURRENT_TIMESTAMP + INTERVAL 1 HOUR),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reset_token_id` PRIMARY KEY(`id`),
	CONSTRAINT `reset_token_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
ALTER TABLE `reset_token` ADD CONSTRAINT `reset_token_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
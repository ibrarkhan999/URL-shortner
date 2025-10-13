CREATE TABLE `token` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`token` varchar(8) NOT NULL,
	`expire_at` timestamp DEFAULT (CURRENT_TIMESTAMP + INTERVAL 1 DAY),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `token_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `token` ADD CONSTRAINT `token_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
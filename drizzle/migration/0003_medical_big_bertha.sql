CREATE TABLE `google` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`provider` enum('google','github') NOT NULL,
	`provider_account_id` varchar(255) NOT NULL,
	`is_valid_email` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `google_id` PRIMARY KEY(`id`),
	CONSTRAINT `google_provider_account_id_unique` UNIQUE(`provider_account_id`)
);
--> statement-breakpoint
ALTER TABLE `google` ADD CONSTRAINT `google_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
CREATE TABLE `otps` (
	`uid` text PRIMARY KEY NOT NULL,
	`code` text(6) DEFAULT (printf('%06d', ABS(RANDOM()) % 1000000)) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`uid`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`uid` text NOT NULL,
	`refresh` text(6) NOT NULL,
	`user_agent` text,
	`ip_address` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`uid`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'reader' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`two_factor_authentication` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
DROP TRIGGER IF EXISTS `update_updated_at_on_sessions`;
CREATE TRIGGER `update_updated_at_on_sessions`
AFTER UPDATE ON `sessions`
FOR EACH ROW
BEGIN
    UPDATE `sessions`
    SET `updated_at` = unixepoch()
    WHERE `id` = OLD.`id` AND `uid` = OLD.`uid`;
END;
DROP TRIGGER IF EXISTS `update_updated_at_on_users`;
CREATE TRIGGER `update_updated_at_on_users`
AFTER UPDATE ON `users`
FOR EACH ROW
BEGIN
    UPDATE `users`
    SET `updated_at` = unixepoch()
    WHERE `id` = OLD.`id`;
END;

CREATE TABLE `stages` (
	`id` text NOT NULL,
	`trip_id` text NOT NULL,
	`name` text NOT NULL,
	`date` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`image` text,
	`content` text NOT NULL,
	`keywords` text,
	`published` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	PRIMARY KEY(`id`, `trip_id`),
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE cascade ON DELETE cascade
);
DROP TRIGGER IF EXISTS `update_updated_at_on_stages`;
CREATE TRIGGER `update_updated_at_on_stages`
AFTER UPDATE ON `stages`
FOR EACH ROW
BEGIN
    UPDATE `stages`
    SET `updated_at` = unixepoch()
    WHERE `id` = OLD.`id` AND `trip_id` = OLD.`trip_id`;
END;

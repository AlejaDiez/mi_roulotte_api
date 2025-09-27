CREATE TABLE `trips` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`date` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`image` text,
	`video` text,
	`content` text NOT NULL,
	`keywords` text,
	`published` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer
);
DROP TRIGGER IF EXISTS `update_updated_at_on_trips`;
CREATE TRIGGER `update_updated_at_on_trips`
AFTER UPDATE ON `trips`
FOR EACH ROW
BEGIN
    UPDATE `trips`
    SET `updated_at` = unixepoch()
    WHERE `id` = OLD.`id`;
END;

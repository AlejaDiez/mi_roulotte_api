CREATE TABLE `comments` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`trip_id` text NOT NULL,
	`stage_id` text,
	`username` text NOT NULL,
	`email` text,
	`content` text NOT NULL,
	`replied_to` text,
	`user_agent` text,
	`ip_address` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`replied_to`) REFERENCES `comments`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `__new_stages` (
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
    `allow_comments` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	PRIMARY KEY(`id`, `trip_id`),
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE cascade ON DELETE cascade
);
INSERT INTO `__new_stages`(
    "id",
    "trip_id",
    "name",
    "date",
    "title",
    "description",
    "image",
    "content",
    "keywords",
    "published",
    "allow_comments",
    "created_at",
    "updated_at"
) SELECT "id", "trip_id", "name", "date", "title", "description", "image", "content", "keywords", "published", false as "allow_comments", "created_at", "updated_at" FROM `stages`;
DROP TABLE `stages`;
ALTER TABLE `__new_stages` RENAME TO `stages`;--> statement-breakpoint
DROP TRIGGER IF EXISTS `update_updated_at_on_stages`;
CREATE TRIGGER `update_updated_at_on_stages`
AFTER UPDATE ON `stages`
FOR EACH ROW
BEGIN
    UPDATE `stages`
    SET `updated_at` = unixepoch()
    WHERE `id` = OLD.`id` AND `trip_id` = OLD.`trip_id`;
END;
CREATE TABLE `__new_trips` (
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
    `allow_comments` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer
);
INSERT INTO `__new_trips`(
    "id",
    "name",
    "date",
    "title",
    "description",
    "image",
    "video",
    "content",
    "keywords",
    "published",
    "allow_comments",
    "created_at",
    "updated_at"
) SELECT "id", "name", "date", "title", "description", "image", "video", "content", "keywords", "published", false as "allow_comments", "created_at", "updated_at" FROM `trips`;
DROP TABLE `trips`;
ALTER TABLE `__new_trips` RENAME TO `trips`;--> statement-breakpoint
DROP TRIGGER IF EXISTS `update_updated_at_on_trips`;
CREATE TRIGGER `update_updated_at_on_trips`
AFTER UPDATE ON `trips`
FOR EACH ROW
BEGIN
    UPDATE `trips`
    SET `updated_at` = unixepoch()
    WHERE `id` = OLD.`id`;
END;
DROP TRIGGER IF EXISTS `delete_comments_on_stage_deleted`;
CREATE TRIGGER `delete_comments_on_stage_deleted`
BEFORE DELETE ON `stages`
FOR EACH ROW
BEGIN
    DELETE FROM `comments`
    WHERE `stage_id` = OLD.`id`
        AND `trip_id` = OLD.`trip_id`;
END;
DROP TRIGGER IF EXISTS `update_updated_at_on_comments`;
CREATE TRIGGER `update_updated_at_on_comments`
AFTER UPDATE ON `comments`
FOR EACH ROW
BEGIN
    UPDATE `comments`
    SET `updated_at` = unixepoch()
    WHERE `id` = OLD.`id`;
END;
DROP TRIGGER IF EXISTS `validate_stage_allow_comments`;
CREATE TRIGGER `validate_stage_allow_comments`
BEFORE INSERT ON `comments`
FOR EACH ROW
WHEN NEW.`stage_id` IS NOT NULL
    AND NOT EXISTS (
        SELECT 1
        FROM `stages`
        WHERE `trip_id` = NEW.`trip_id`
            AND `id` = NEW.`stage_id`
            AND `allow_comments` = 1
    )
BEGIN
    SELECT RAISE(ABORT, 'Stage does not allow comments');
END;
DROP TRIGGER IF EXISTS `validate_comment_stage_on_update`;
CREATE TRIGGER `validate_comment_stage_on_update`
BEFORE UPDATE ON `comments`
FOR EACH ROW
WHEN NEW.`stage_id` IS NOT NULL
    AND NOT EXISTS (
        SELECT 1
        FROM `stages`
        WHERE `id` = NEW.`stage_id` AND `trip_id` = NEW.`trip_id`
    )
BEGIN
    SELECT RAISE(ABORT, 'FOREIGN KEY constraint failed');
END;
DROP TRIGGER IF EXISTS `validate_comment_stage`;
CREATE TRIGGER `validate_comment_stage`
BEFORE INSERT ON `comments`
FOR EACH ROW
WHEN NEW.`stage_id` IS NOT NULL
    AND NOT EXISTS (
        SELECT 1
        FROM `stages`
        WHERE `id` = NEW.`stage_id` AND `trip_id` = NEW.`trip_id`
    )
BEGIN
    SELECT RAISE(ABORT, 'FOREIGN KEY constraint failed');
END;
DROP TRIGGER IF EXISTS `validate_trip_allow_comments`;
CREATE TRIGGER `validate_trip_allow_comments`
BEFORE INSERT ON `comments`
FOR EACH ROW
WHEN NEW.`stage_id` IS NULL
    AND NOT EXISTS (
        SELECT 1
        FROM `trips`
        WHERE `id` = NEW.`trip_id`
            AND `allow_comments` = 1
    )
BEGIN
    SELECT RAISE(ABORT, 'Trip does not allow comments');
END;

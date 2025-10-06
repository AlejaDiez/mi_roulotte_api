DROP TRIGGER IF EXISTS `update_updated_at_on_comments`;
CREATE TRIGGER `update_updated_at_on_comments`
AFTER UPDATE ON `comments`
FOR EACH ROW
BEGIN
    UPDATE `comments`
    SET `updated_at` = unixepoch()
    WHERE `id` = OLD.`id`;
END;

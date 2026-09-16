CREATE TABLE `training_events` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`created` integer NOT NULL,
	`payload` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_training_owner_created` ON `training_events` (`owner`,`created`);
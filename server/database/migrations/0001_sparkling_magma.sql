CREATE TABLE `thoughts` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `thoughts_published_at_idx` ON `thoughts` (`created_at`);
CREATE TABLE `thoughts` (
	`id` text PRIMARY KEY NOT NULL,
	`mood` text,
	`published_at` integer DEFAULT (unixepoch('now')) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `thoughts_published_at_idx` ON `thoughts` (`published_at`);
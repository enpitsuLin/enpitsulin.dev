PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_post` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_post`("id", "title", "slug", "content", "status", "published_at", "created_at", "updated_at") SELECT "id", "title", "slug", "content", "status", "published_at", "created_at", "updated_at" FROM `post`;--> statement-breakpoint
DROP TABLE `post`;--> statement-breakpoint
ALTER TABLE `__new_post` RENAME TO `post`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `post_slug_unique` ON `post` (`slug`);--> statement-breakpoint
CREATE INDEX `post_slug_idx` ON `post` (`slug`);--> statement-breakpoint
CREATE INDEX `post_status_idx` ON `post` (`status`);--> statement-breakpoint
CREATE INDEX `post_published_at_idx` ON `post` (`published_at`);--> statement-breakpoint
CREATE INDEX `post_created_at_idx` ON `post` (`created_at`);
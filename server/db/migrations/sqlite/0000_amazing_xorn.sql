CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (unixepoch('now')) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('now')) NOT NULL,
	`published_at` integer DEFAULT (unixepoch('now')),
	`is_delete` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `post_slug_idx` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `post_published_at_idx` ON `posts` (`published_at`);--> statement-breakpoint
CREATE TABLE `post_tag` (
	`post_id` text,
	`tag_id` text,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `post_tag_idx` ON `post_tag` (`post_id`,`tag_id`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch('now')) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE INDEX `idx_name` ON `tags` (`name`);--> statement-breakpoint
CREATE TABLE `thoughts` (
	`id` text PRIMARY KEY NOT NULL,
	`mood` text,
	`published_at` integer DEFAULT (unixepoch('now')) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch('now')) NOT NULL,
	`is_delete` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `thoughts_published_at_idx` ON `thoughts` (`published_at`);
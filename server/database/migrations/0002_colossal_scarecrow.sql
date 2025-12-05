ALTER TABLE `posts` ADD `is_delete` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `thoughts` ADD `is_delete` integer DEFAULT false NOT NULL;
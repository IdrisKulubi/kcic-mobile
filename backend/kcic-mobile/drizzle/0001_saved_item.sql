CREATE TABLE "saved_item" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"item_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "saved_item" ADD CONSTRAINT "saved_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "saved_item_user_key_unique" ON "saved_item" USING btree ("user_id","item_key");--> statement-breakpoint
CREATE INDEX "saved_item_user_id_idx" ON "saved_item" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "saved_item_created_at_idx" ON "saved_item" USING btree ("created_at");

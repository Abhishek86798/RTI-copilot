CREATE TABLE "applications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"grievance" text NOT NULL,
	"authority" jsonb NOT NULL,
	"extracted_references" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"full_text" text DEFAULT '' NOT NULL,
	"portal_text" text DEFAULT '' NOT NULL,
	"life_or_liberty_flag" boolean DEFAULT false NOT NULL,
	"life_or_liberty_reason" text DEFAULT '' NOT NULL,
	"applicant" jsonb NOT NULL,
	"status" text DEFAULT 'drafting' NOT NULL,
	"filing_channel" text,
	"filed_at" timestamp with time zone,
	"registration_number" text,
	"via_apio" boolean DEFAULT false NOT NULL,
	"response_logged_at" timestamp with time zone,
	"response_note" text,
	"appeal" jsonb,
	"simulated_days_elapsed" integer,
	"is_demo" boolean DEFAULT false NOT NULL,
	"deadline_notified_at" timestamp with time zone,
	"appeal_notified_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "applications_user_id_idx" ON "applications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "applications_sweep_idx" ON "applications" USING btree ("status","filed_at");
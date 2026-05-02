CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'scheduled', 'running', 'paused', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."contact_status" AS ENUM('active', 'inactive', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."conversation_status" AS ENUM('open', 'closed', 'pending');--> statement-breakpoint
CREATE TYPE "public"."direction" AS ENUM('inbound', 'outbound');--> statement-breakpoint
CREATE TYPE "public"."message_status" AS ENUM('sent', 'delivered', 'read', 'failed');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('text', 'image', 'video', 'audio', 'document', 'location');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('email', 'in_app');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('whatsapp', 'instagram', 'both');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "api_credentials" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"platform" "platform" NOT NULL,
	"token" varchar(1024) NOT NULL,
	"secretKey" varchar(1024),
	"phoneNumberId" varchar(255),
	"businessAccountId" varchar(255),
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"messageTemplate" text NOT NULL,
	"platform" "platform" DEFAULT 'whatsapp' NOT NULL,
	"status" "campaign_status" DEFAULT 'draft' NOT NULL,
	"targetAudience" text,
	"totalRecipients" integer DEFAULT 0 NOT NULL,
	"successfulSends" integer DEFAULT 0 NOT NULL,
	"failedSends" integer DEFAULT 0 NOT NULL,
	"scheduledAt" timestamp,
	"startedAt" timestamp,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chatbot_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"triggerKeywords" text NOT NULL,
	"responseTemplate" text NOT NULL,
	"platform" "platform" DEFAULT 'both' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"externalId" varchar(255) NOT NULL,
	"platform" "platform" NOT NULL,
	"name" varchar(255),
	"phoneNumber" varchar(20),
	"instagramHandle" varchar(255),
	"profilePicture" varchar(512),
	"lastInteractionAt" timestamp,
	"status" "contact_status" DEFAULT 'active' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"contactId" integer NOT NULL,
	"platform" "platform" NOT NULL,
	"externalConversationId" varchar(255),
	"subject" varchar(255),
	"status" "conversation_status" DEFAULT 'open' NOT NULL,
	"unreadCount" integer DEFAULT 0 NOT NULL,
	"lastMessageAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversationId" integer NOT NULL,
	"contactId" integer NOT NULL,
	"userId" integer NOT NULL,
	"externalMessageId" varchar(255),
	"platform" "platform" NOT NULL,
	"direction" "direction" NOT NULL,
	"messageType" "message_type" DEFAULT 'text' NOT NULL,
	"content" text,
	"mediaUrl" varchar(512),
	"mediaType" varchar(50),
	"status" "message_status" DEFAULT 'sent' NOT NULL,
	"senderName" varchar(255),
	"senderPhone" varchar(20),
	"senderInstagramHandle" varchar(255),
	"llmSuggestion" text,
	"automatedResponse" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"messageId" integer,
	"conversationId" integer,
	"sentAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"emailNotificationsEnabled" boolean DEFAULT true NOT NULL,
	"unreadMessageThreshold" integer DEFAULT 10 NOT NULL,
	"notifyOnEveryMessage" boolean DEFAULT false NOT NULL,
	"notifyOnImportantKeywords" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_settings_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"passwordHash" varchar(255),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE INDEX "idx_user_id" ON "api_credentials" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_campaigns_user_id" ON "campaigns" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_campaigns_status" ON "campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_chatbot_rules_user_active" ON "chatbot_rules" USING btree ("userId","isActive");--> statement-breakpoint
CREATE INDEX "idx_contacts_user_id" ON "contacts" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_contacts_user_platform" ON "contacts" USING btree ("userId","platform");--> statement-breakpoint
CREATE INDEX "idx_conversations_user_id" ON "conversations" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_conversations_user_status" ON "conversations" USING btree ("userId","status");--> statement-breakpoint
CREATE INDEX "idx_conversations_user_platform" ON "conversations" USING btree ("userId","platform");--> statement-breakpoint
CREATE INDEX "idx_messages_conversation_id" ON "messages" USING btree ("conversationId");--> statement-breakpoint
CREATE INDEX "idx_messages_user_created" ON "messages" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "idx_notification_logs_user_type" ON "notification_logs" USING btree ("userId","type");
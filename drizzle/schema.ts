import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// API Credentials - Armazena tokens e credenciais de APIs externas
export const apiCredentials = mysqlTable(
  "api_credentials",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    platform: mysqlEnum("platform", ["whatsapp", "instagram"]).notNull(),
    token: varchar("token", { length: 1024 }).notNull(),
    secretKey: varchar("secretKey", { length: 1024 }),
    phoneNumberId: varchar("phoneNumberId", { length: 255 }),
    businessAccountId: varchar("businessAccountId", { length: 255 }),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("idx_user_id").on(table.userId),
  })
);

export type ApiCredential = typeof apiCredentials.$inferSelect;
export type InsertApiCredential = typeof apiCredentials.$inferInsert;

// Contacts - Gerencia contatos de diferentes plataformas
export const contacts = mysqlTable(
  "contacts",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    externalId: varchar("externalId", { length: 255 }).notNull(),
    platform: mysqlEnum("platform", ["whatsapp", "instagram"]).notNull(),
    name: varchar("name", { length: 255 }),
    phoneNumber: varchar("phoneNumber", { length: 20 }),
    instagramHandle: varchar("instagramHandle", { length: 255 }),
    profilePicture: varchar("profilePicture", { length: 512 }),
    lastInteractionAt: timestamp("lastInteractionAt"),
    status: mysqlEnum("status", ["active", "inactive", "blocked"]).default("active").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("idx_contacts_user_id").on(table.userId),
    userPlatformIdx: index("idx_contacts_user_platform").on(table.userId, table.platform),
  })
);

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

// Conversations - Agrupa mensagens de um contato
export const conversations = mysqlTable(
  "conversations",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    contactId: int("contactId").notNull(),
    platform: mysqlEnum("platform", ["whatsapp", "instagram"]).notNull(),
    externalConversationId: varchar("externalConversationId", { length: 255 }),
    subject: varchar("subject", { length: 255 }),
    status: mysqlEnum("status", ["open", "closed", "pending"]).default("open").notNull(),
    unreadCount: int("unreadCount").default(0).notNull(),
    lastMessageAt: timestamp("lastMessageAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("idx_conversations_user_id").on(table.userId),
    userStatusIdx: index("idx_conversations_user_status").on(table.userId, table.status),
    userPlatformIdx: index("idx_conversations_user_platform").on(table.userId, table.platform),
  })
);

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

// Messages - Armazena todas as mensagens
export const messages = mysqlTable(
  "messages",
  {
    id: int("id").autoincrement().primaryKey(),
    conversationId: int("conversationId").notNull(),
    contactId: int("contactId").notNull(),
    userId: int("userId").notNull(),
    externalMessageId: varchar("externalMessageId", { length: 255 }),
    platform: mysqlEnum("platform", ["whatsapp", "instagram"]).notNull(),
    direction: mysqlEnum("direction", ["inbound", "outbound"]).notNull(),
    messageType: mysqlEnum("messageType", ["text", "image", "video", "audio", "document", "location"]).default("text").notNull(),
    content: text("content"),
    mediaUrl: varchar("mediaUrl", { length: 512 }),
    mediaType: varchar("mediaType", { length: 50 }),
    status: mysqlEnum("status", ["sent", "delivered", "read", "failed"]).default("sent").notNull(),
    senderName: varchar("senderName", { length: 255 }),
    senderPhone: varchar("senderPhone", { length: 20 }),
    senderInstagramHandle: varchar("senderInstagramHandle", { length: 255 }),
    llmSuggestion: text("llmSuggestion"),
    automatedResponse: boolean("automatedResponse").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    conversationIdIdx: index("idx_messages_conversation_id").on(table.conversationId),
    userCreatedIdx: index("idx_messages_user_created").on(table.userId, table.createdAt),
  })
);

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Chatbot Rules - Define regras de automação
export const chatbotRules = mysqlTable(
  "chatbot_rules",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    triggerKeywords: text("triggerKeywords").notNull(),
    responseTemplate: text("responseTemplate").notNull(),
    platform: mysqlEnum("platform", ["whatsapp", "instagram", "both"]).default("both").notNull(),
    priority: int("priority").default(0).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userActiveIdx: index("idx_chatbot_rules_user_active").on(table.userId, table.isActive),
  })
);

export type ChatbotRule = typeof chatbotRules.$inferSelect;
export type InsertChatbotRule = typeof chatbotRules.$inferInsert;

// Notification Settings - Configurações de notificação
export const notificationSettings = mysqlTable(
  "notification_settings",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique(),
    emailNotificationsEnabled: boolean("emailNotificationsEnabled").default(true).notNull(),
    unreadMessageThreshold: int("unreadMessageThreshold").default(10).notNull(),
    notifyOnEveryMessage: boolean("notifyOnEveryMessage").default(false).notNull(),
    notifyOnImportantKeywords: text("notifyOnImportantKeywords"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  }
);

export type NotificationSetting = typeof notificationSettings.$inferSelect;
export type InsertNotificationSetting = typeof notificationSettings.$inferInsert;

// Notification Logs - Registra notificações enviadas
export const notificationLogs = mysqlTable(
  "notification_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    type: mysqlEnum("type", ["email", "in_app"]).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    messageId: int("messageId"),
    conversationId: int("conversationId"),
    sentAt: timestamp("sentAt").defaultNow().notNull(),
  },
  (table) => ({
    userTypeIdx: index("idx_notification_logs_user_type").on(table.userId, table.type),
  })
);

export type NotificationLog = typeof notificationLogs.$inferSelect;
export type InsertNotificationLog = typeof notificationLogs.$inferInsert;
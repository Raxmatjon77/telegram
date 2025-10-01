CREATE TYPE "Role" AS ENUM ('bot', 'user', 'admin', 'moderator');

CREATE TYPE "language" AS ENUM ('uzb', 'rus', 'eng', 'kaa');

CREATE TYPE "user_status" AS ENUM ('online', 'offline', 'away', 'busy', 'invisible');

CREATE TYPE "message_type" AS ENUM ('text', 'file', 'voice', 'video', 'image', 'document', 'sticker', 'gif', 'poll', 'location', 'contact', 'reply', 'forwarded', 'system');

CREATE TYPE "chat_type" AS ENUM ('private', 'group', 'channel', 'supergroup');

CREATE TYPE "file_type" AS ENUM ('image', 'video', 'audio', 'document', 'voice', 'sticker');

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "username" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "password" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "status" "user_status" NOT NULL DEFAULT 'offline',
    "language" "language" NOT NULL DEFAULT 'uzb',
    "is_bot" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "last_seen_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_agent" TEXT,
    "ip" TEXT,
    "device" TEXT,
    "platform" TEXT,
    "last_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "socket_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chats" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "type" "chat_type" NOT NULL,
    "owner_id" TEXT,
    "avatar" TEXT,
    "invite_link" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "members_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chat_participants" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_muted" BOOLEAN NOT NULL DEFAULT false,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "is_read" BOOLEAN NOT NULL DEFAULT true,
    "last_read_message_id" TEXT,
    "unread_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "chat_participants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "text" TEXT,
    "type" "message_type" NOT NULL DEFAULT 'text',
    "content" TEXT,
    "reply_to_id" TEXT,
    "forwarded_from_id" TEXT,
    "thread_id" TEXT,
    "edited_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "message_reactions" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_reactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "message_id" TEXT,
    "uploader_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_type" "file_type" NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "duration" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_blocks" (
    "id" TEXT NOT NULL,
    "blocker_id" TEXT NOT NULL,
    "blocked_id" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_blocks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

CREATE INDEX "users_email_idx" ON "users"("email");

CREATE INDEX "users_username_idx" ON "users"("username");

CREATE INDEX "users_phone_idx" ON "users"("phone");

CREATE INDEX "users_is_bot_idx" ON "users"("is_bot");

CREATE INDEX "users_is_verified_idx" ON "users"("is_verified");

CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

CREATE INDEX "users_last_seen_at_idx" ON "users"("last_seen_at");

CREATE UNIQUE INDEX "sessions_socket_id_key" ON "sessions"("socket_id");

CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

CREATE INDEX "sessions_is_active_idx" ON "sessions"("is_active");

CREATE INDEX "sessions_last_seen_idx" ON "sessions"("last_seen");

CREATE UNIQUE INDEX "chats_invite_link_key" ON "chats"("invite_link");

CREATE INDEX "chat_title_index" ON "chats"("title");

CREATE INDEX "chat_type_index" ON "chats"("type");

CREATE INDEX "chat_owner_index" ON "chats"("owner_id");

CREATE INDEX "chats_is_public_idx" ON "chats"("is_public");

CREATE INDEX "chats_invite_link_idx" ON "chats"("invite_link");

CREATE INDEX "chats_members_count_idx" ON "chats"("members_count");

CREATE INDEX "chats_deleted_at_idx" ON "chats"("deleted_at");

CREATE UNIQUE INDEX "chats_title_type_key" ON "chats"("title", "type");

CREATE INDEX "chat_participant_user_index" ON "chat_participants"("user_id");

CREATE INDEX "chat_participant_chat_index" ON "chat_participants"("chat_id");

CREATE INDEX "chat_participants_role_idx" ON "chat_participants"("role");

CREATE INDEX "chat_participants_left_at_idx" ON "chat_participants"("left_at");

CREATE UNIQUE INDEX "chat_participants_user_id_chat_id_key" ON "chat_participants"("user_id", "chat_id");

CREATE INDEX "message_chat_index" ON "messages"("chat_id");

CREATE INDEX "message_sender_index" ON "messages"("sender_id");

CREATE INDEX "message_type_index" ON "messages"("type");

CREATE INDEX "message_created_at_index" ON "messages"("created_at");

CREATE INDEX "messages_reply_to_id_idx" ON "messages"("reply_to_id");

CREATE INDEX "messages_thread_id_idx" ON "messages"("thread_id");

CREATE INDEX "messages_edited_at_idx" ON "messages"("edited_at");

CREATE INDEX "messages_deleted_at_idx" ON "messages"("deleted_at");

CREATE INDEX "messages_chat_id_created_at_idx" ON "messages"("chat_id", "created_at");

CREATE UNIQUE INDEX "messages_chat_id_id_key" ON "messages"("chat_id", "id");

CREATE INDEX "message_reactions_message_id_idx" ON "message_reactions"("message_id");

CREATE INDEX "message_reactions_user_id_idx" ON "message_reactions"("user_id");

CREATE INDEX "message_reactions_emoji_idx" ON "message_reactions"("emoji");

CREATE UNIQUE INDEX "message_reactions_message_id_user_id_emoji_key" ON "message_reactions"("message_id", "user_id", "emoji");

CREATE INDEX "files_message_id_idx" ON "files"("message_id");

CREATE INDEX "files_uploader_id_idx" ON "files"("uploader_id");

CREATE INDEX "files_file_type_idx" ON "files"("file_type");

CREATE INDEX "files_mime_type_idx" ON "files"("mime_type");

CREATE INDEX "files_created_at_idx" ON "files"("created_at");

CREATE INDEX "user_blocks_blocker_id_idx" ON "user_blocks"("blocker_id");

CREATE INDEX "user_blocks_blocked_id_idx" ON "user_blocks"("blocked_id");

CREATE UNIQUE INDEX "user_blocks_blocker_id_blocked_id_key" ON "user_blocks"("blocker_id", "blocked_id");

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chats" ADD CONSTRAINT "chats_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_forwarded_from_id_fkey" FOREIGN KEY ("forwarded_from_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "files" ADD CONSTRAINT "files_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "files" ADD CONSTRAINT "files_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

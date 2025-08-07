/*
  Warnings:

  - You are about to drop the column `is_archived` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `is_muted` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `is_pinned` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `is_read` on the `chats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chat_participants" ADD COLUMN     "is_archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_muted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_pinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "chats" DROP COLUMN "is_archived",
DROP COLUMN "is_muted",
DROP COLUMN "is_pinned",
DROP COLUMN "is_read";

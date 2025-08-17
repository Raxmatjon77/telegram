/*
  Warnings:

  - A unique constraint covering the columns `[device_id]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "device_id" TEXT;

-- CreateIndex
CREATE INDEX "sessions_device_id_idx" ON "sessions"("device_id");

-- CreateIndex
CREATE UNIQUE INDEX "device_id_uqk" ON "sessions"("device_id");

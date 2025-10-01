ALTER TABLE "sessions" ADD COLUMN     "device_id" TEXT;

CREATE INDEX "sessions_device_id_idx" ON "sessions"("device_id");

CREATE UNIQUE INDEX "device_id_uqk" ON "sessions"("device_id");

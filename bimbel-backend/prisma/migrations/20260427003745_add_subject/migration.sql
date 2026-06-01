ALTER TABLE "Subject"
ADD COLUMN "code" TEXT,
ADD COLUMN "levelId" TEXT;

UPDATE "Subject"
SET "code" = CONCAT('MAP-00', id);

UPDATE "Subject"
SET "levelId" = (
  SELECT id FROM "Level" LIMIT 1
);

ALTER TABLE "Subject"
ALTER COLUMN "code" SET NOT NULL,
ALTER COLUMN "levelId" SET NOT NULL;

ALTER TABLE "Subject"
ADD CONSTRAINT "Subject_code_key" UNIQUE ("code");

ALTER TABLE "Subject"
ADD CONSTRAINT "Subject_levelId_fkey"
FOREIGN KEY ("levelId") REFERENCES "Level"("id");
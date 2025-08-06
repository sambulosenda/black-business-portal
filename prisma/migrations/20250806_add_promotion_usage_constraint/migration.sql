-- Add check constraint to ensure usageCount never exceeds usageLimit
-- This provides database-level protection against race conditions
ALTER TABLE "Promotion" 
ADD CONSTRAINT check_promotion_usage_limit 
CHECK (
  "usageLimit" IS NULL OR 
  "usageCount" <= "usageLimit"
);

-- Add index on usageCount for better performance on atomic updates
CREATE INDEX IF NOT EXISTS "Promotion_usageCount_idx" ON "Promotion"("usageCount");
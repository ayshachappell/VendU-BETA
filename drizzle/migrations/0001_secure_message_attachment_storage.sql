CREATE POLICY "Conversation participants can read message attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'message-attachments'
  AND split_part(name, '/', 2) ~ '^[0-9a-fA-F-]{36}$'
  AND EXISTS (
    SELECT 1
    FROM public.conversations c
    WHERE c.id = split_part(storage.objects.name, '/', 2)::uuid
      AND (auth.jwt() ->> 'email') IN (c.participant_a_email, c.participant_b_email)
  )
);

CREATE POLICY "Message attachments reject direct client uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Message attachments reject direct client changes"
ON storage.objects
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "Message attachments reject direct client deletion"
ON storage.objects
FOR DELETE
TO authenticated
USING (false);
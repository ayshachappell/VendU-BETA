ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS appointment_at timestamptz,
  ADD COLUMN IF NOT EXISTS vendor_email text,
  ADD COLUMN IF NOT EXISTS conversation_id uuid,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'booked';

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  build text NOT NULL DEFAULT 'main',
  participant_a_email text NOT NULL,
  participant_b_email text NOT NULL,
  participant_a_name text,
  participant_b_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (build, participant_a_email, participant_b_email)
);
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read conversations" ON public.conversations FOR SELECT TO authenticated USING ((auth.jwt() ->> 'email') IN (participant_a_email, participant_b_email));
CREATE POLICY "Participants create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK ((auth.jwt() ->> 'email') IN (participant_a_email, participant_b_email));
CREATE POLICY "Participants update conversations" ON public.conversations FOR UPDATE TO authenticated USING ((auth.jwt() ->> 'email') IN (participant_a_email, participant_b_email)) WITH CHECK ((auth.jwt() ->> 'email') IN (participant_a_email, participant_b_email));
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.conversation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  build text NOT NULL DEFAULT 'main',
  sender_email text,
  sender_name text NOT NULL,
  kind text NOT NULL DEFAULT 'text',
  body text,
  attachment jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.conversation_messages TO authenticated;
GRANT ALL ON public.conversation_messages TO service_role;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read messages" ON public.conversation_messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (auth.jwt() ->> 'email') IN (c.participant_a_email, c.participant_b_email)));
CREATE POLICY "Participants send messages" ON public.conversation_messages FOR INSERT TO authenticated WITH CHECK (sender_email = (auth.jwt() ->> 'email') AND EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND sender_email IN (c.participant_a_email, c.participant_b_email)));
CREATE INDEX conversation_messages_thread_idx ON public.conversation_messages(conversation_id, created_at);

CREATE TABLE public.conversation_reads (
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  reader_email text NOT NULL,
  read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, reader_email)
);
GRANT SELECT, INSERT, UPDATE ON public.conversation_reads TO authenticated;
GRANT ALL ON public.conversation_reads TO service_role;
ALTER TABLE public.conversation_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their conversation reads" ON public.conversation_reads FOR ALL TO authenticated USING (reader_email = (auth.jwt() ->> 'email')) WITH CHECK (reader_email = (auth.jwt() ->> 'email'));

CREATE TABLE public.message_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  build text NOT NULL DEFAULT 'main',
  kind text NOT NULL DEFAULT 'market',
  reference_id text NOT NULL,
  title text NOT NULL,
  seller_email text NOT NULL,
  buyer_email text NOT NULL,
  seller_name text NOT NULL,
  buyer_name text NOT NULL,
  payment_methods jsonb NOT NULL DEFAULT '[]'::jsonb,
  appointment_at timestamptz,
  meetup_available_at timestamptz,
  reminder_sent_at timestamptz,
  buyer_met_at timestamptz,
  seller_met_at timestamptz,
  buyer_paid_at timestamptz,
  seller_paid_at timestamptz,
  payment_not_received_at timestamptz,
  reported_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (build, kind, reference_id, buyer_email)
);
GRANT SELECT, INSERT, UPDATE ON public.message_transactions TO authenticated;
GRANT ALL ON public.message_transactions TO service_role;
ALTER TABLE public.message_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants read transactions" ON public.message_transactions FOR SELECT TO authenticated USING ((auth.jwt() ->> 'email') IN (seller_email, buyer_email));
CREATE POLICY "Participants create transactions" ON public.message_transactions FOR INSERT TO authenticated WITH CHECK ((auth.jwt() ->> 'email') IN (seller_email, buyer_email));
CREATE POLICY "Participants update transactions" ON public.message_transactions FOR UPDATE TO authenticated USING ((auth.jwt() ->> 'email') IN (seller_email, buyer_email)) WITH CHECK ((auth.jwt() ->> 'email') IN (seller_email, buyer_email));
CREATE TRIGGER update_message_transactions_updated_at BEFORE UPDATE ON public.message_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX message_transactions_reminder_idx ON public.message_transactions(meetup_available_at, reminder_sent_at);

CREATE TABLE public.message_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES public.message_transactions(id) ON DELETE CASCADE,
  build text NOT NULL DEFAULT 'main',
  kind text NOT NULL DEFAULT 'message',
  message text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.message_notifications TO authenticated;
GRANT ALL ON public.message_notifications TO service_role;
ALTER TABLE public.message_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read their message notifications" ON public.message_notifications FOR SELECT TO authenticated USING (recipient_email = (auth.jwt() ->> 'email'));
CREATE POLICY "Users update their message notifications" ON public.message_notifications FOR UPDATE TO authenticated USING (recipient_email = (auth.jwt() ->> 'email')) WITH CHECK (recipient_email = (auth.jwt() ->> 'email'));
CREATE INDEX message_notifications_recipient_idx ON public.message_notifications(recipient_email, build, created_at DESC);

ALTER TABLE public.bookings ADD CONSTRAINT bookings_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE SET NULL;
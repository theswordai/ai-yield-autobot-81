CREATE POLICY "anyone insert announcements" ON public.announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone update announcements" ON public.announcements FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anyone delete announcements" ON public.announcements FOR DELETE USING (true);
GRANT INSERT, UPDATE, DELETE ON public.announcements TO anon, authenticated;
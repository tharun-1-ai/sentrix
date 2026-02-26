
CREATE POLICY "Users can delete own scan reports"
ON public.scan_reports
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own community reports"
ON public.community_reports
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

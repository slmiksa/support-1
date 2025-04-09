
CREATE OR REPLACE FUNCTION public.add_ticket_response_with_admin(
  p_ticket_id TEXT,
  p_response TEXT,
  p_is_admin BOOLEAN DEFAULT TRUE,
  p_admin_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_response_id UUID;
BEGIN
  -- Insert the response with admin_id
  INSERT INTO public.ticket_responses (ticket_id, response, is_admin, admin_id)
  VALUES (p_ticket_id, p_response, p_is_admin, p_admin_id)
  RETURNING id INTO v_response_id;
  
  -- Update the ticket's updated_at timestamp
  UPDATE public.tickets 
  SET updated_at = now()
  WHERE ticket_id = p_ticket_id;
  
  RETURN v_response_id;
END;
$$;

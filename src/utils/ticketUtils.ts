
export const deleteTicket = async (ticketId: string): Promise<boolean> => {
  try {
    console.log(`Attempting to delete ticket with ID: ${ticketId}`);
    
    // First, delete all responses associated with the ticket
    const { error: responsesError } = await supabase
      .from('ticket_responses')
      .delete()
      .eq('ticket_id', ticketId);

    if (responsesError) {
      console.error('Error deleting ticket responses:', responsesError);
      return false;
    }
    
    console.log(`Successfully deleted responses for ticket: ${ticketId}`);

    // Use the new Supabase RPC function to delete the ticket
    const { data, error } = await supabase
      .rpc('delete_ticket_by_id', { p_ticket_id: ticketId });

    if (error) {
      console.error('Error calling delete_ticket_by_id function:', error);
      return false;
    }

    // Check if the ticket was actually deleted (data will be true if successful)
    if (!data) {
      console.error('Ticket deletion failed');
      return false;
    }
    
    // Double-check that the ticket was actually deleted
    const { data: checkData, error: checkError } = await supabase
      .from('tickets')
      .select('ticket_id')
      .eq('ticket_id', ticketId);
    
    if (checkError) {
      console.error('Error verifying ticket deletion:', checkError);
      return false;
    }
    
    if (checkData && checkData.length > 0) {
      console.error('Ticket still exists after deletion attempt');
      return false;
    }
    
    console.log(`Confirmed ticket ${ticketId} was successfully deleted`);
    return true;
  } catch (error) {
    console.error('Error in deleteTicket:', error);
    return false;
  }
};

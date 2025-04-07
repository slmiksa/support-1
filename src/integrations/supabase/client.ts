
import { createClient } from '@supabase/supabase-js';
import type { Json } from './types';

export type HelpField = {
  id: string;
  title: string;
  content: string;
};

export type SiteSettings = {
  id?: string;
  site_name: string;
  page_title?: string;
  logo_url?: string | null;
  favicon_url?: string | null;
  primary_color: string;
  secondary_color: string;
  text_color: string;
  footer_text?: string;
  support_available?: boolean;
  support_message?: string;
  support_info?: string | null;
  support_help_fields?: HelpField[];
  created_at?: string;
};

// Define PriorityType as a literal union type
export type PriorityType = 'urgent' | 'medium' | 'normal';

// Supabase client setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;


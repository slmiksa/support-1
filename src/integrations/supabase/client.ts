
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
const supabaseUrl = 'https://dmqkgahwnpvtzawncluv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcWtnYWh3bnB2dHphd25jbHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyNjI4MzksImV4cCI6MjA1NzgzODgzOX0.UE1CyrOqzyzfSVkq5krLK_WNxm2_2NZoFC8Y9ex7uow';

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

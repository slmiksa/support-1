
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SupportForm from '@/components/SupportForm';
import DateTimeDisplay from '@/components/DateTimeDisplay';
import { supabase, SiteSettings, HelpField } from '@/integrations/supabase/client';
import { HeadphonesIcon, PhoneOffIcon, HelpCircleIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const [supportStatus, setSupportStatus] = useState({
    available: true,
    message: 'الدعم الفني متواجد'
  });
  const [supportInfo, setSupportInfo] = useState<string | null>(null);
  const [helpFields, setHelpFields] = useState<HelpField[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSupportStatus = async () => {
      try {
        const { data, error } = await supabase.from('site_settings').select('*').single();
        
        if (error) {
          console.error('Error fetching site settings:', error);
          setLoading(false);
          return;
        }
        
        if (data) {
          setSupportStatus({
            available: !!data.support_available,
            message: data.support_message || 'الدعم الفني متواجد'
          });
          
          setSupportInfo(data.support_info || null);

          if (data.support_help_fields) {
            try {
              const helpFieldsData = typeof data.support_help_fields === 'string' 
                ? JSON.parse(data.support_help_fields) 
                : data.support_help_fields;
              
              setHelpFields(Array.isArray(helpFieldsData) ? helpFieldsData : []);
            } catch (e) {
              console.error('Error parsing help fields:', e);
              setHelpFields([]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching support status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSupportStatus();
  }, []);

  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <Header />
      <main className="container px-4 py-8 mx-auto mb-20">
        <Card className="bg-white shadow-md border-t-4 border-company mb-8 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-bold text-center mb-6 text-company">نظام الدعم الفني</h2>
              
              <div className="flex flex-col items-center gap-2 mb-6">
                <DateTimeDisplay />
                
                <div className="flex items-center gap-3 mt-4">
                  <div className={`flex items-center gap-2 py-2 px-4 rounded-full ${supportStatus.available ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                    {supportStatus.available ? <HeadphonesIcon size={18} className="text-green-600" /> : <PhoneOffIcon size={18} className="text-red-600" />}
                    <span className="font-medium text-sm">
                      {supportStatus.message}
                    </span>
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="p-1.5 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors" aria-label="معلومات مهمة">
                              <HelpCircleIcon size={18} className="text-blue-600" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 text-right" align="center">
                            {helpFields.length > 0 ? (
                              <Accordion type="single" collapsible className="w-full">
                                {helpFields.map(field => (
                                  <AccordionItem key={field.id} value={field.id}>
                                    <AccordionTrigger className="text-right">
                                      {field.title}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div dangerouslySetInnerHTML={{
                                        __html: field.content
                                      }} />
                                    </AccordionContent>
                                  </AccordionItem>
                                ))}
                              </Accordion>
                            ) : supportInfo ? (
                              <div className="text-sm" dangerouslySetInnerHTML={{
                                __html: supportInfo
                              }} />
                            ) : (
                              <p>لا توجد معلومات متاحة حالياً</p>
                            )}
                          </PopoverContent>
                        </Popover>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>معلومات مهمة</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <SupportForm />
      </main>
    </div>
  );
};

export default Index;

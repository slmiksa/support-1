
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SupportForm from '@/components/SupportForm';
import DateTimeDisplay from '@/components/DateTimeDisplay';
import { supabase, SiteSettings, HelpField } from '@/integrations/supabase/client';
import { HeadphonesIcon, PhoneOffIcon, HelpCircleIcon, Sparkles } from 'lucide-react';
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
        const {
          data,
          error
        } = await supabase.from('site_settings').select('*');
        
        if (error) {
          console.error('Error fetching site settings:', error);
          setLoading(false);
          return;
        }
        
        if (data && data.length > 0) {
          // Use the first record
          const settingsData = data[0];
          
          setSupportStatus({
            available: !!settingsData.support_available,
            message: settingsData.support_message || 'الدعم الفني متواجد'
          });
          
          setSupportInfo(settingsData.support_info || null);
          
          if (settingsData.support_help_fields) {
            try {
              const helpFieldsData = typeof settingsData.support_help_fields === 'string' 
                ? JSON.parse(settingsData.support_help_fields) 
                : settingsData.support_help_fields;
              
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
    <div className="min-h-screen pb-16 bg-gradient-to-b from-slate-50 to-blue-50">
      <Header />
      <main className="container px-4 py-8 mx-auto mb-20">
        <Card className="bg-white shadow-xl border-t-4 border-company mb-8 overflow-hidden rounded-xl transform hover:scale-[1.01] transition-all">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center gap-3 mb-6 animate-slide-in pt-4 pb-2">
                <DateTimeDisplay />
                
                <div className="flex items-center gap-3 mt-4">
                  <div className={`flex items-center gap-2 py-2 px-4 rounded-full shadow-md transition-all ${
                    supportStatus.available 
                      ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200' 
                      : 'bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-200'
                  }`}>
                    {supportStatus.available 
                      ? <HeadphonesIcon size={18} className="text-green-600 animate-bounce-gentle" /> 
                      : <PhoneOffIcon size={18} className="text-red-600" />
                    }
                    <span className="font-medium text-sm">
                      {supportStatus.message}
                    </span>
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button 
                              className="p-1.5 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors shadow-md hover:shadow-lg" 
                              aria-label="معلومات مهمة"
                            >
                              <HelpCircleIcon size={18} className="text-blue-600" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 text-right bg-white/90 backdrop-blur-sm border-blue-100 shadow-xl" align="center">
                            {helpFields.length > 0 ? (
                              <Accordion type="single" collapsible className="w-full">
                                {helpFields.map(field => (
                                  <AccordionItem key={field.id} value={field.id}>
                                    <AccordionTrigger className="text-right hover:text-blue-600 transition-colors">
                                      {field.title}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-gray-700">
                                      <div dangerouslySetInnerHTML={{ __html: field.content }} />
                                    </AccordionContent>
                                  </AccordionItem>
                                ))}
                              </Accordion>
                            ) : supportInfo ? (
                              <div className="text-sm" dangerouslySetInnerHTML={{ __html: supportInfo }} />
                            ) : (
                              <p className="text-gray-500">لا توجد معلومات متاحة حالياً</p>
                            )}
                          </PopoverContent>
                        </Popover>
                      </TooltipTrigger>
                      <TooltipContent className="bg-blue-800 text-white">
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

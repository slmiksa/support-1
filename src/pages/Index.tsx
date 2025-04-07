
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SupportForm from '@/components/SupportForm';
import DateTimeDisplay from '@/components/DateTimeDisplay';
import { supabase, SiteSettings } from '@/integrations/supabase/client';
import { HeadphonesIcon, PhoneOffIcon, HelpCircleIcon } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Index = () => {
  const [supportStatus, setSupportStatus] = useState({
    available: true,
    message: 'الدعم الفني متواجد'
  });
  const [supportInfo, setSupportInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupportStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('support_available, support_message, support_info')
          .single();
          
        if (error) throw error;
        
        if (data) {
          setSupportStatus({
            available: data.support_available,
            message: data.support_message || 'الدعم الفني متواجد'
          });
          setSupportInfo(data.support_info);
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
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header />
      <main className="container px-4 py-4 mx-auto mb-20">
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold text-center text-[#222222] mb-6">نظام الدعم الفني</h2>
            <div className="flex flex-col items-center gap-2 mb-4">
              <DateTimeDisplay />
              
              <div className="flex items-center gap-3 mt-4">
                <div 
                  className={`flex items-center gap-2 py-2 px-4 rounded-full ${
                    supportStatus.available 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  {supportStatus.available 
                    ? <HeadphonesIcon size={18} className="text-green-600" /> 
                    : <PhoneOffIcon size={18} className="text-red-600" />
                  }
                  <span className="font-medium text-sm">
                    {supportStatus.message}
                  </span>
                </div>
                
                {supportInfo && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button 
                              className="p-1.5 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                              aria-label="معلومات مهمة"
                            >
                              <HelpCircleIcon size={18} className="text-blue-600" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 text-right" align="center">
                            <div 
                              className="text-sm"
                              dangerouslySetInnerHTML={{ __html: supportInfo }}
                            />
                          </PopoverContent>
                        </Popover>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>معلومات مهمة</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>
        </div>
        <SupportForm />
      </main>
    </div>
  );
};

export default Index;

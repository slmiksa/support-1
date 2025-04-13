
import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { FileText } from 'lucide-react';

interface ReportControlsProps {
  startDate: Date;
  endDate: Date;
  period: string;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  setPeriod: (period: string) => void;
  exportToExcel: () => void;
}

const ReportControls: React.FC<ReportControlsProps> = ({
  startDate,
  endDate,
  period,
  setStartDate,
  setEndDate,
  setPeriod,
  exportToExcel
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-right text-base">إنشاء تقرير</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:rtl:space-x-reverse">
          <div className="w-full md:w-1/3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الفترة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">اليوم</SelectItem>
                <SelectItem value="week">آخر أسبوع</SelectItem>
                <SelectItem value="month">الشهر الحالي</SelectItem>
                <SelectItem value="quarter">آخر 3 أشهر</SelectItem>
                <SelectItem value="year">آخر سنة</SelectItem>
                <SelectItem value="custom">فترة مخصصة</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {period === 'custom' && (
            <div className="flex flex-col md:flex-row md:space-x-4 md:rtl:space-x-reverse space-y-2 md:space-y-0">
              <div className="w-full md:w-1/2">
                <DatePicker
                  date={startDate}
                  onChange={date => date && setStartDate(date)}
                  placeholder="تاريخ البداية"
                />
              </div>
              <div className="w-full md:w-1/2">
                <DatePicker
                  date={endDate}
                  onChange={date => date && setEndDate(date)}
                  placeholder="تاريخ النهاية"
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-4">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={exportToExcel}
          >
            <FileText className="h-4 w-4" />
            <span>تصدير Excel</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportControls;

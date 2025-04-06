
import { Card, CardContent } from '@/components/ui/card';

const LoadingForm = () => {
  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-in">
      <Card className="border-company/20 glass">
        <CardContent className="flex items-center justify-center min-h-[300px]">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mr-2">جاري تحميل النموذج...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingForm;

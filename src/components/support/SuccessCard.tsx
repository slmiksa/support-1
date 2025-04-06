
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SuccessCardProps {
  ticketId: string;
  onNewTicket: () => void;
}

const SuccessCard = ({ ticketId, onNewTicket }: SuccessCardProps) => {
  return (
    <Card className="border-company/20 glass">
      <CardHeader>
        <CardTitle className="text-center">تم إرسال طلب الدعم بنجاح</CardTitle>
        <CardDescription className="text-center">يرجى الاحتفاظ برقم الطلب لمتابعة حالة الطلب</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">رقم الطلب الخاص بك:</p>
          <p className="text-2xl font-bold text-company bg-company-light py-2 px-4 rounded-md">{ticketId}</p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          يمكنك متابعة حالة طلبك من خلال صفحة "متابعة طلب الدعم"
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={onNewTicket} className="mt-2">
          إرسال طلب جديد
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SuccessCard;

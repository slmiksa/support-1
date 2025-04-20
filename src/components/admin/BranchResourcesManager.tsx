import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BranchResource {
  id: string;
  branch_id: string;
  phones_available: number;
  phones_in_use: number;
  pcs_available: number;
  pcs_in_use: number;
  pc_screens_available: number;
  pc_screens_in_use: number;
  printers_available: number;
  printers_in_use: number;
  pc_cameras_available: number;
  pc_cameras_in_use: number;
}

interface Branch {
  id: string;
  name: string;
}

const BranchResourcesManager = () => {
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [resources, setResources] = useState<BranchResource[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<BranchResource>>({
    phones_available: 0,
    phones_in_use: 0,
    pcs_available: 0,
    pcs_in_use: 0,
    pc_screens_available: 0,
    pc_screens_in_use: 0,
    printers_available: 0,
    printers_in_use: 0,
    pc_cameras_available: 0,
    pc_cameras_in_use: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('*');

      if (branchesError) throw branchesError;
      setBranches(branchesData || []);

      const { data: resourcesData, error: resourcesError } = await supabase
        .from('branch_resources')
        .select('*');

      if (resourcesError) throw resourcesError;
      setResources(resourcesData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!selectedBranch) {
        toast.error('الرجاء اختيار الفرع');
        return;
      }

      const existingResource = resources.find(r => r.branch_id === selectedBranch);
      
      if (editMode && existingResource) {
        const { error } = await supabase
          .from('branch_resources')
          .update({
            phones_available: formData.phones_available,
            phones_in_use: formData.phones_in_use,
            pcs_available: formData.pcs_available,
            pcs_in_use: formData.pcs_in_use,
            pc_screens_available: formData.pc_screens_available,
            pc_screens_in_use: formData.pc_screens_in_use,
            printers_available: formData.printers_available,
            printers_in_use: formData.printers_in_use,
            pc_cameras_available: formData.pc_cameras_available,
            pc_cameras_in_use: formData.pc_cameras_in_use
          })
          .eq('branch_id', selectedBranch);

        if (error) throw error;
        toast.success('تم تحديث موارد الفرع بنجاح');
      } else {
        const { error } = await supabase
          .from('branch_resources')
          .insert({
            branch_id: selectedBranch,
            phones_available: formData.phones_available,
            phones_in_use: formData.phones_in_use,
            pcs_available: formData.pcs_available,
            pcs_in_use: formData.pcs_in_use,
            pc_screens_available: formData.pc_screens_available,
            pc_screens_in_use: formData.pc_screens_in_use,
            printers_available: formData.printers_available,
            printers_in_use: formData.printers_in_use,
            pc_cameras_available: formData.pc_cameras_available,
            pc_cameras_in_use: formData.pc_cameras_in_use
          });

        if (error) throw error;
        toast.success('تم إضافة موارد الفرع بنجاح');
      }

      setDialogOpen(false);
      setEditMode(false);
      setSelectedBranch(null);
      setFormData({
        phones_available: 0,
        phones_in_use: 0,
        pcs_available: 0,
        pcs_in_use: 0,
        pc_screens_available: 0,
        pc_screens_in_use: 0,
        printers_available: 0,
        printers_in_use: 0,
        pc_cameras_available: 0,
        pc_cameras_in_use: 0
      });
      fetchData();
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('حدث خطأ أثناء حفظ البيانات');
    }
  };

  const handleEditResource = (branchId: string) => {
    const resource = resources.find(r => r.branch_id === branchId);
    if (resource) {
      setSelectedBranch(branchId);
      setFormData({
        phones_available: resource.phones_available,
        phones_in_use: resource.phones_in_use,
        pcs_available: resource.pcs_available,
        pcs_in_use: resource.pcs_in_use,
        pc_screens_available: resource.pc_screens_available,
        pc_screens_in_use: resource.pc_screens_in_use,
        printers_available: resource.printers_available,
        printers_in_use: resource.printers_in_use,
        pc_cameras_available: resource.pc_cameras_available,
        pc_cameras_in_use: resource.pc_cameras_in_use
      });
      setEditMode(true);
      setDialogOpen(true);
    }
  };

  const getBranchName = (branchId: string) => {
    return branches.find(b => b.id === branchId)?.name || 'غير معروف';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-right text-xl font-bold text-company">موارد الفروع</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="flex items-center gap-2"
                onClick={() => {
                  setEditMode(false);
                  setSelectedBranch(null);
                  setFormData({
                    phones_available: 0,
                    phones_in_use: 0,
                    pcs_available: 0,
                    pcs_in_use: 0,
                    pc_screens_available: 0,
                    pc_screens_in_use: 0,
                    printers_available: 0,
                    printers_in_use: 0,
                    pc_cameras_available: 0,
                    pc_cameras_in_use: 0
                  });
                }}
              >
                <Plus size={16} />
                <span>إضافة موارد فرع</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-right">
                  {editMode ? 'تعديل موارد الفرع' : 'إضافة موارد فرع جديد'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {!editMode && (
                  <select
                    className="w-full p-2 border rounded-md text-right"
                    value={selectedBranch || ''}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                  >
                    <option value="">اختر الفرع</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-right mb-2">الهواتف المتوفرة</label>
                    <Input
                      type="number"
                      value={formData.phones_available}
                      onChange={(e) => setFormData(prev => ({ ...prev, phones_available: parseInt(e.target.value) || 0 }))}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-right mb-2">الهواتف المستخدمة</label>
                    <Input
                      type="number"
                      value={formData.phones_in_use}
                      onChange={(e) => setFormData(prev => ({ ...prev, phones_in_use: parseInt(e.target.value) || 0 }))}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-right mb-2">أجهزة الكومبيوتر المتوفرة</label>
                    <Input
                      type="number"
                      value={formData.pcs_available}
                      onChange={(e) => setFormData(prev => ({ ...prev, pcs_available: parseInt(e.target.value) || 0 }))}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-right mb-2">أجهزة الكومبيوتر المستخدمة</label>
                    <Input
                      type="number"
                      value={formData.pcs_in_use}
                      onChange={(e) => setFormData(prev => ({ ...prev, pcs_in_use: parseInt(e.target.value) || 0 }))}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-right mb-2">شاشات الكومبيوتر المتوفرة</label>
                    <Input
                      type="number"
                      value={formData.pc_screens_available}
                      onChange={(e) => setFormData(prev => ({ ...prev, pc_screens_available: parseInt(e.target.value) || 0 }))}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-right mb-2">شاشات الكومبيوتر المستخدمة</label>
                    <Input
                      type="number"
                      value={formData.pc_screens_in_use}
                      onChange={(e) => setFormData(prev => ({ ...prev, pc_screens_in_use: parseInt(e.target.value) || 0 }))}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-right mb-2">الطابعات المتوفرة</label>
                    <Input
                      type="number"
                      value={formData.printers_available}
                      onChange={(e) => setFormData(prev => ({ ...prev, printers_available: parseInt(e.target.value) || 0 }))}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-right mb-2">الطابعات المستخدمة</label>
                    <Input
                      type="number"
                      value={formData.printers_in_use}
                      onChange={(e) => setFormData(prev => ({ ...prev, printers_in_use: parseInt(e.target.value) || 0 }))}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-right mb-2">كاميرات الكومبيوتر المتوفرة</label>
                    <Input
                      type="number"
                      value={formData.pc_cameras_available}
                      onChange={(e) => setFormData(prev => ({ ...prev, pc_cameras_available: parseInt(e.target.value) || 0 }))}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-right mb-2">كاميرات الكومبيوتر المستخدمة</label>
                    <Input
                      type="number"
                      value={formData.pc_cameras_in_use}
                      onChange={(e) => setFormData(prev => ({ ...prev, pc_cameras_in_use: parseInt(e.target.value) || 0 }))}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSubmit}>
                  {editMode ? 'تحديث' : 'إضافة'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-2">جاري تحميل البيانات...</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم الفرع</TableHead>
                  <TableHead className="text-right">الهواتف المتوفرة</TableHead>
                  <TableHead className="text-right">الهواتف المستخدمة</TableHead>
                  <TableHead className="text-right">أجهزة الكومبيوتر المتوفرة</TableHead>
                  <TableHead className="text-right">أجهزة الكومبيوتر المستخدمة</TableHead>
                  <TableHead className="text-right">شاشات الكومبيوتر المتوفرة</TableHead>
                  <TableHead className="text-right">شاشات الكومبيوتر المستخدمة</TableHead>
                  <TableHead className="text-right">الطابعات المتوفرة</TableHead>
                  <TableHead className="text-right">الطابعات المستخدمة</TableHead>
                  <TableHead className="text-right">كاميرات الكومبيوتر المتوفرة</TableHead>
                  <TableHead className="text-right">كاميرات الكومبيوتر المستخدمة</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.length > 0 ? (
                  resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium text-right">{getBranchName(resource.branch_id)}</TableCell>
                      <TableCell className="text-right">{resource.phones_available}</TableCell>
                      <TableCell className="text-right">{resource.phones_in_use}</TableCell>
                      <TableCell className="text-right">{resource.pcs_available}</TableCell>
                      <TableCell className="text-right">{resource.pcs_in_use}</TableCell>
                      <TableCell className="text-right">{resource.pc_screens_available}</TableCell>
                      <TableCell className="text-right">{resource.pc_screens_in_use}</TableCell>
                      <TableCell className="text-right">{resource.printers_available}</TableCell>
                      <TableCell className="text-right">{resource.printers_in_use}</TableCell>
                      <TableCell className="text-right">{resource.pc_cameras_available}</TableCell>
                      <TableCell className="text-right">{resource.pc_cameras_in_use}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditResource(resource.branch_id)}
                          title="تعديل"
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center h-24">
                      <p>لا توجد موارد مسجلة للفروع</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BranchResourcesManager;

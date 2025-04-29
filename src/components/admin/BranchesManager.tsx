
import { useState, useEffect } from 'react';
import { Branch } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Trash2, Plus, Pencil } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { supabase } from '@/integrations/supabase/client';

const BranchesManager = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBranchName, setNewBranchName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<{ id: string, name: string } | null>(null);
  const { hasPermission } = useAdminAuth();
  const canManageAdmins = hasPermission('manage_admins');

  useEffect(() => {
    fetchBranches();
    // Check if there are no branches and add default ones if needed
    setTimeout(() => {
      checkAndAddDefaultBranches();
    }, 1000);
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name');

      if (error) throw error;

      console.log("Fetched branches:", data);
      setBranches(data || []);
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error('فشل في تحميل الفروع');
    } finally {
      setLoading(false);
    }
  };

  const checkAndAddDefaultBranches = async () => {
    try {
      const { data } = await supabase
        .from('branches')
        .select('count()', { count: 'exact', head: true });
      
      const count = data || 0;
      
      console.log("Checking branches for default setup:", count);
      
      if (count === 0) {
        const defaultBranches = [
          "ALWASL DAMMAM",
          "ALWASL JEDDAH",
          "ALWASL RIYADH",
          "MADA"
        ];
        
        console.log("Adding default branches:", defaultBranches);
        
        for (const branchName of defaultBranches) {
          await createBranch(branchName);
          console.log(`Added default branch: ${branchName}`);
        }
        
        toast.success('تم إضافة الفروع الافتراضية بنجاح');
        fetchBranches();
      }
    } catch (error) {
      console.error("Error in checkAndAddDefaultBranches:", error);
    }
  };

  const createBranch = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .insert({ name })
        .select();
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error("Error creating branch:", error);
      return { success: false };
    }
  };

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) {
      toast.error('يرجى إدخال اسم الفرع');
      return;
    }

    const result = await createBranch(newBranchName);
    if (result.success) {
      toast.success('تم إنشاء الفرع بنجاح');
      setNewBranchName('');
      setDialogOpen(false);
      fetchBranches();
    } else {
      toast.error('فشل في إنشاء الفرع');
    }
  };

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch({ id: String(branch.id), name: branch.name });
    setEditDialogOpen(true);
  };

  const handleUpdateBranchName = async () => {
    if (!editingBranch) return;
    
    if (!editingBranch.name.trim()) {
      toast.error('يرجى إدخال اسم الفرع');
      return;
    }

    try {
      const { error } = await supabase
        .from('branches')
        .update({ name: editingBranch.name })
        .eq('id', editingBranch.id);

      if (error) throw error;

      toast.success('تم تحديث اسم الفرع بنجاح');
      setEditDialogOpen(false);
      setEditingBranch(null);
      fetchBranches();
    } catch (error) {
      console.error('Error updating branch name:', error);
      toast.error('فشل في تحديث اسم الفرع');
    }
  };

  const handleDeleteBranch = async (id: string | number) => {
    const branchId = String(id);
    
    if (confirm('هل أنت متأكد من حذف هذا الفرع؟')) {
      try {
        const { error } = await supabase
          .from('branches')
          .delete()
          .eq('id', branchId);
        
        if (error) throw error;
        
        toast.success('تم حذف الفرع بنجاح');
        fetchBranches();
      } catch (error) {
        console.error('Error deleting branch:', error);
        toast.error('فشل في حذف الفرع');
      }
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-right text-xl font-bold text-company">إدارة الفروع</CardTitle>
      </CardHeader>
      <CardContent>
        {canManageAdmins && (
          <div className="flex justify-end mb-4">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  <span>إضافة فرع جديد</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-right">إضافة فرع جديد</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Input
                      id="branchName"
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                      className="col-span-4"
                      placeholder="اسم الفرع"
                      dir="rtl"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleCreateBranch}>إضافة</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

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
                  {canManageAdmins && <TableHead className="text-right w-40">إجراءات</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.length > 0 ? (
                  branches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium text-right">{branch.name}</TableCell>
                      {canManageAdmins && (
                        <TableCell className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditBranch(branch)}
                            title="تعديل"
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteBranch(branch.id)}
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={canManageAdmins ? 2 : 1} className="text-center h-24">
                      <p>لا توجد فروع مسجلة</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Edit Branch Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-right">تعديل اسم الفرع</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Input
                  id="editBranchName"
                  value={editingBranch?.name || ''}
                  onChange={(e) => setEditingBranch(prev => prev ? {...prev, name: e.target.value} : null)}
                  className="col-span-4"
                  placeholder="اسم الفرع"
                  dir="rtl"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleUpdateBranchName}>حفظ التغييرات</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default BranchesManager;

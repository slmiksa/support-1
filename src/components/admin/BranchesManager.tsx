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
      
      // Remove duplicate branches (keep one of each name)
      const uniqueBranches = removeDuplicateBranches(data || []);
      
      setBranches(uniqueBranches);
      return uniqueBranches;
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error('فشل في تحميل الفروع');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Function to remove duplicate branches by name
  const removeDuplicateBranches = (branchList: Branch[]): Branch[] => {
    const seen = new Set();
    const uniqueBranches: Branch[] = [];
    
    // First pass: collect one branch per name (keeping the earliest created one)
    const nameToEarliestBranch = new Map<string, Branch>();
    
    branchList.forEach(branch => {
      if (!nameToEarliestBranch.has(branch.name)) {
        nameToEarliestBranch.set(branch.name, branch);
      } else {
        const existing = nameToEarliestBranch.get(branch.name)!;
        // Keep the one with the earlier created_at date
        if (new Date(branch.created_at!) < new Date(existing.created_at!)) {
          nameToEarliestBranch.set(branch.name, branch);
        }
      }
    });
    
    // Convert map back to array
    return Array.from(nameToEarliestBranch.values());
  };

  // Delete duplicate branches
  const cleanupDuplicateBranches = async () => {
    try {
      const { data: allBranches, error } = await supabase
        .from('branches')
        .select('*')
        .order('created_at');

      if (error) throw error;

      // Group branches by name
      const branchesByName = new Map<string, Branch[]>();
      allBranches?.forEach(branch => {
        if (!branchesByName.has(branch.name)) {
          branchesByName.set(branch.name, []);
        }
        branchesByName.get(branch.name)!.push(branch);
      });

      // Keep only the first branch of each name and delete the rest
      for (const [_, branches] of branchesByName) {
        if (branches.length > 1) {
          // Keep the first one (oldest), delete the rest
          for (let i = 1; i < branches.length; i++) {
            await supabase
              .from('branches')
              .delete()
              .eq('id', branches[i].id);
          }
        }
      }

      await fetchBranches();
    } catch (error) {
      console.error("Error cleaning up duplicate branches:", error);
    }
  };

  useEffect(() => {
    // Clean up duplicate branches when component mounts
    cleanupDuplicateBranches();
  }, []);

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

    // Check if branch with same name already exists
    if (branches.some(branch => branch.name.toLowerCase() === newBranchName.trim().toLowerCase())) {
      toast.error('الفرع موجود بالفعل');
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

    // Check if branch with same name already exists (excluding the current branch)
    if (branches.some(branch => 
      branch.id !== editingBranch.id && 
      branch.name.toLowerCase() === editingBranch.name.trim().toLowerCase()
    )) {
      toast.error('يوجد فرع آخر بنفس الاسم');
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
        <div className="flex justify-between items-center">
          <CardTitle className="text-right text-xl font-bold text-company">إدارة الفروع</CardTitle>
          <Button className="flex items-center gap-2" onClick={() => setDialogOpen(true)}>
            <Plus size={16} />
            <span>إضافة فرع جديد</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
                  <TableHead className="text-right w-40">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.length > 0 ? (
                  branches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium text-right">{branch.name}</TableCell>
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
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center h-24">
                      <p>لا توجد فروع مسجلة</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Add Branch Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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

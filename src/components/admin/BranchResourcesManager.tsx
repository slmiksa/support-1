import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash, RefreshCw, FileDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface ResourceType {
  id: string;
  name: string;
  created_at?: string;
}

interface BranchResourceType {
  id: string;
  branch_id: string;
  resource_type_id: string;
  available: number;
  in_use: number;
  created_at?: string;
  updated_at?: string;
  resource_type?: ResourceType;
}

interface Branch {
  id: string;
  name: string;
}

const BranchResourcesManager = () => {
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [branchResourceTypes, setBranchResourceTypes] = useState<BranchResourceType[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedResourceType, setSelectedResourceType] = useState<string>('');
  const [newResourceName, setNewResourceName] = useState('');
  const [formData, setFormData] = useState({
    available: 0,
    in_use: 0
  });
  const [addResourceDialogOpen, setAddResourceDialogOpen] = useState(false);
  const [resourceManagementDialog, setResourceManagementDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch branches
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('*');

      if (branchesError) throw branchesError;
      setBranches(branchesData || []);

      // Fetch resource types
      const { data: resourceTypesData, error: resourceTypesError } = await supabase
        .from('resource_types')
        .select('*');

      if (resourceTypesError) throw resourceTypesError;
      setResourceTypes(resourceTypesData || []);

      // Fetch branch resource types with their resource type names
      const { data: branchResourceTypesData, error: branchResourceTypesError } = await supabase
        .from('branch_resource_types')
        .select(`
          *,
          resource_type:resource_type_id (id, name)
        `);

      if (branchResourceTypesError) throw branchResourceTypesError;
      setBranchResourceTypes(branchResourceTypesData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleAddResource = async () => {
    try {
      if (!selectedBranch) {
        toast.error('الرجاء اختيار الفرع');
        return;
      }

      if (!selectedResourceType && !newResourceName) {
        toast.error('الرجاء اختيار نوع المورد أو إدخال اسم مورد جديد');
        return;
      }

      let resourceTypeId = selectedResourceType;

      // إذا كان المستخدم أدخل اسم مورد جديد، أضفه إلى قاعدة البيانات
      if (newResourceName && !selectedResourceType) {
        const { data: newResourceType, error: newResourceError } = await supabase
          .from('resource_types')
          .insert({ name: newResourceName })
          .select()
          .single();

        if (newResourceError) throw newResourceError;
        resourceTypeId = newResourceType.id;
        
        // تحديث قائمة أنواع الموارد
        setResourceTypes([...resourceTypes, newResourceType]);
      }

      // التحقق مما إذا كان المورد موجودًا بالفعل لهذا الفرع
      const existingResource = branchResourceTypes.find(
        r => r.branch_id === selectedBranch.id && r.resource_type_id === resourceTypeId
      );

      if (existingResource) {
        toast.error('هذا المورد موجود بالفعل لهذا الفرع');
        return;
      }

      // إضافة المورد إلى الفرع
      const { data: newBranchResource, error: addError } = await supabase
        .from('branch_resource_types')
        .insert({
          branch_id: selectedBranch.id,
          resource_type_id: resourceTypeId,
          available: formData.available,
          in_use: formData.in_use
        })
        .select(`
          *,
          resource_type:resource_type_id (id, name)
        `)
        .single();

      if (addError) throw addError;

      // تحديث قائمة موارد الفروع
      setBranchResourceTypes([...branchResourceTypes, newBranchResource]);
      
      // إعادة تعيين النموذج
      setFormData({ available: 0, in_use: 0 });
      setSelectedResourceType('');
      setNewResourceName('');
      setAddResourceDialogOpen(false);
      
      toast.success('تمت إضافة المورد بنجاح');
    } catch (error) {
      console.error('Error adding resource:', error);
      toast.error('حدث خطأ أثناء إضافة المورد');
    }
  };

  const handleSubmit = async () => {
    try {
      if (!selectedBranch) {
        toast.error('الرجاء اختيار الفرع');
        return;
      }

      if (editMode && selectedResourceType) {
        // تحديث المورد الموجود
        const resourceToEdit = branchResourceTypes.find(
          r => r.branch_id === selectedBranch.id && r.resource_type_id === selectedResourceType
        );
        
        if (!resourceToEdit) {
          toast.error('لم يتم العثور على المورد');
          return;
        }

        const { error } = await supabase
          .from('branch_resource_types')
          .update({
            available: formData.available,
            in_use: formData.in_use
          })
          .eq('id', resourceToEdit.id);

        if (error) throw error;
        
        // تحديث القائمة المحلية
        setBranchResourceTypes(prevResources =>
          prevResources.map(r => 
            r.id === resourceToEdit.id 
              ? { ...r, available: formData.available, in_use: formData.in_use }
              : r
          )
        );
        
        toast.success('تم تحديث المورد بنجاح');
      } 

      setDialogOpen(false);
      setEditMode(false);
      setSelectedResourceType('');
      setFormData({ available: 0, in_use: 0 });
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('حدث خطأ أثناء حفظ البيانات');
    }
  };

  const handleEditResource = (branchId: string, resourceTypeId: string) => {
    const resource = branchResourceTypes.find(
      r => r.branch_id === branchId && r.resource_type_id === resourceTypeId
    );
    
    if (resource) {
      setSelectedBranch(branches.find(b => b.id === branchId) || null);
      setSelectedResourceType(resourceTypeId);
      setFormData({
        available: resource.available,
        in_use: resource.in_use
      });
      setEditMode(true);
      setDialogOpen(true);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المورد من الفرع؟')) {
      try {
        const { error } = await supabase
          .from('branch_resource_types')
          .delete()
          .eq('id', resourceId);

        if (error) throw error;
        
        // تحديث القائمة المحلية
        setBranchResourceTypes(prevResources => 
          prevResources.filter(r => r.id !== resourceId)
        );
        
        toast.success('تم حذف المورد بنجاح');
      } catch (error) {
        console.error('Error deleting resource:', error);
        toast.error('حدث خطأ أثناء حذف المورد');
      }
    }
  };

  const handleCreateResourceType = async () => {
    if (!newResourceName.trim()) {
      toast.error('الرجاء إدخال اسم للمورد');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('resource_types')
        .insert({ name: newResourceName })
        .select()
        .single();

      if (error) throw error;
      
      setResourceTypes([...resourceTypes, data]);
      toast.success('تم إنشاء نوع مورد جديد بنجاح');
      setNewResourceName('');
      setResourceManagementDialog(false);
    } catch (error) {
      console.error('Error creating resource type:', error);
      toast.error('حدث خطأ أثناء إنشاء نوع المورد');
    }
  };

  const getBranchName = (branchId: string) => {
    return branches.find(b => b.id === branchId)?.name || 'غير معروف';
  };

  const getResourceTypeName = (resourceTypeId: string) => {
    return resourceTypes.find(rt => rt.id === resourceTypeId)?.name || 'غير معروف';
  };

  const getResourcesForBranch = (branchId: string) => {
    return branchResourceTypes.filter(r => r.branch_id === branchId);
  };

  const BranchResourceRow = ({ resource }: { resource: BranchResourceType }) => (
    <div className="flex justify-between items-center py-2 border-b last:border-0">
      <span className="text-right font-medium text-gray-600">
        {resource.resource_type?.name || getResourceTypeName(resource.resource_type_id)}
      </span>
      <div className="flex gap-4">
        <div className="text-center">
          <span className="text-sm text-gray-500 block">المتوفر</span>
          <span className="font-semibold">{resource.available}</span>
        </div>
        <div className="text-center">
          <span className="text-sm text-gray-500 block">المستخدم</span>
          <span className="font-semibold">{resource.in_use}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditResource(resource.branch_id, resource.resource_type_id)}
            title="تعديل"
          >
            <Edit className="h-4 w-4 text-blue-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteResource(resource.id)}
            title="حذف"
          >
            <Trash className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );

  const BranchCard = ({ branch }: { branch: Branch }) => {
    const resources = getResourcesForBranch(branch.id);
    
    return (
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold text-company">{branch.name}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="text-xs flex items-center gap-1"
            onClick={() => {
              setSelectedBranch(branch);
              setAddResourceDialogOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            إضافة مورد
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {resources.length > 0 ? (
              resources.map((resource) => (
                <BranchResourceRow key={resource.id} resource={resource} />
              ))
            ) : (
              <div className="text-center py-3 text-gray-500">
                لا توجد موارد مسجلة لهذا الفرع
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleExportToExcel = async () => {
    try {
      await exportBranchResourcesToExcel(branches, branchResourceTypes);
      toast.success('تم تصدير البيانات بنجاح');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('حدث خطأ أثناء تصدير البيانات');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="border-company/20 glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              onClick={handleExportToExcel}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              تصدير إلى Excel
            </Button>
            <CardTitle className="text-2xl text-right">موارد الفروع</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Dialog open={resourceManagementDialog} onOpenChange={setResourceManagementDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="ml-2">
                  إدارة أنواع الموارد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-right">إدارة أنواع الموارد</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <h4 className="text-right mb-2 font-medium">أنواع الموارد الحالية</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">اسم المورد</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resourceTypes.map(type => (
                        <TableRow key={type.id}>
                          <TableCell className="text-right">{type.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-6">
                    <h4 className="text-right mb-2 font-medium">إضافة نوع مورد جديد</h4>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateResourceType}>إضافة</Button>
                      <Input 
                        value={newResourceName} 
                        onChange={(e) => setNewResourceName(e.target.value)} 
                        placeholder="اسم المورد الجديد"
                        className="text-right"
                      />
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button onClick={fetchData} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                  جاري التحميل...
                </>
              ) : (
                <>
                  <RefreshCw className="ml-2 h-4 w-4" />
                  تحديث البيانات
                </>
              )}
            </Button>
          </div>

          <Dialog open={addResourceDialogOpen} onOpenChange={setAddResourceDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-right">
                  إضافة مورد لفرع {selectedBranch?.name}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <h4 className="text-right mb-2">اختيار نوع المورد</h4>
                  <select
                    className="w-full p-2 border rounded-md text-right"
                    value={selectedResourceType}
                    onChange={(e) => {
                      setSelectedResourceType(e.target.value);
                      setNewResourceName('');
                    }}
                  >
                    <option value="">اختر نوع المورد</option>
                    {resourceTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <h4 className="text-right mb-2">أو إضافة نوع مورد جديد</h4>
                  <Input
                    type="text"
                    value={newResourceName}
                    onChange={(e) => {
                      setNewResourceName(e.target.value);
                      setSelectedResourceType('');
                    }}
                    placeholder="اسم المورد الجديد"
                    className="text-right"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-right mb-2">العدد المتوفر</label>
                    <Input
                      type="number"
                      value={formData.available}
                      onChange={(e) => setFormData(prev => ({ ...prev, available: parseInt(e.target.value) || 0 }))}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-right mb-2">العدد المستخدم</label>
                    <Input
                      type="number"
                      value={formData.in_use}
                      onChange={(e) => setFormData(prev => ({ ...prev, in_use: parseInt(e.target.value) || 0 }))}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddResource}>
                  إضافة
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-right">
                  {editMode ? 'تعديل مورد' : 'إضافة مورد جديد'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {editMode && (
                  <div className="text-right font-medium">
                    نوع المورد: {getResourceTypeName(selectedResourceType)}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-right mb-2">العدد المتوفر</label>
                    <Input
                      type="number"
                      value={formData.available}
                      onChange={(e) => setFormData(prev => ({ ...prev, available: parseInt(e.target.value) || 0 }))}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-right mb-2">العدد المستخدم</label>
                    <Input
                      type="number"
                      value={formData.in_use}
                      onChange={(e) => setFormData(prev => ({ ...prev, in_use: parseInt(e.target.value) || 0 }))}
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

          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-2">جاري تحميل البيانات...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branches.length > 0 ? (
                branches.map((branch) => (
                  <BranchCard key={branch.id} branch={branch} />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p>لا توجد فروع مسجلة</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BranchResourcesManager;

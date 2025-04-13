
import { useState, useEffect, FormEvent } from 'react';
import { toast } from 'sonner';
import {
  getAllSiteFields,
  updateSiteField,
  createSiteField,
  deleteSiteField,
  updateFieldOrder,
  SiteField,
  updateSystemFieldName
} from '@/utils/ticketUtils';
import { SYSTEM_FIELDS, SYSTEM_FIELD_LABELS } from '@/components/support/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { RefreshCw, Plus, Pencil, Trash, ArrowUp, ArrowDown, Type } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

const SiteFieldsManager = () => {
  const [fields, setFields] = useState<SiteField[]>([]);
  const [loading, setLoading] = useState(true);
  const [fieldName, setFieldName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [isSystemField, setIsSystemField] = useState(false);
  const [editingSystemField, setEditingSystemField] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [editingField, setEditingField] = useState<SiteField | null>(null);
  const [editingPlaceholder, setEditingPlaceholder] = useState('');

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const fieldsData = await getAllSiteFields();
      setFields(fieldsData);
    } catch (error) {
      console.error('Error fetching site fields:', error);
      toast.error('فشل في تحميل حقول الموقع');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRequired = async (id: string | number) => {
    const fieldId = String(id);
    try {
      const fieldToUpdate = fields.find(field => field.id === fieldId);
      if (!fieldToUpdate) {
        console.error('Field not found:', fieldId);
        toast.error('لم يتم العثور على الحقل');
        return;
      }

      await updateSiteField(fieldId, { is_required: !fieldToUpdate.is_required });
      setFields(prevFields =>
        prevFields.map(field =>
          field.id === fieldId ? { ...field, is_required: !field.is_required } : field
        )
      );
      toast.success('تم تحديث حالة الإلزامية');
    } catch (error) {
      console.error('Error toggling required status:', error);
      toast.error('فشل في تحديث حالة الإلزامية');
    }
  };

  const handleToggleActive = async (id: string | number) => {
    const fieldId = String(id);
    try {
      const fieldToUpdate = fields.find(field => field.id === fieldId);
      if (!fieldToUpdate) {
        console.error('Field not found:', fieldId);
        toast.error('لم يتم العثور على الحقل');
        return;
      }

      await updateSiteField(fieldId, { is_active: !fieldToUpdate.is_active });
      setFields(prevFields =>
        prevFields.map(field =>
          field.id === fieldId ? { ...field, is_active: !field.is_active } : field
        )
      );
      toast.success('تم تحديث حالة التفعيل');
    } catch (error) {
      console.error('Error toggling active status:', error);
      toast.error('فشل في تحديث حالة التفعيل');
    }
  };

  const handleRenameField = async (id: string | number) => {
    const fieldId = String(id);
    try {
      const fieldToUpdate = fields.find(field => field.id === fieldId);
      if (!fieldToUpdate) {
        console.error('Field not found:', fieldId);
        toast.error('لم يتم العثور على الحقل');
        return;
      }

      const newDisplayName = prompt('أدخل الاسم المعروض الجديد:', fieldToUpdate.display_name);
      if (newDisplayName && newDisplayName !== fieldToUpdate.display_name) {
        await updateSiteField(fieldId, { display_name: newDisplayName });
        setFields(prevFields =>
          prevFields.map(field =>
            field.id === fieldId ? { ...field, display_name: newDisplayName } : field
          )
        );
        toast.success('تم تحديث الاسم المعروض');
      }
    } catch (error) {
      console.error('Error renaming field:', error);
      toast.error('فشل في تحديث الاسم المعروض');
    }
  };

  const handleUpdatePlaceholder = async () => {
    if (!editingField) return;
    
    try {
      await updateSiteField(String(editingField.id), { 
        placeholder: editingPlaceholder 
      });
      
      setFields(prevFields =>
        prevFields.map(field =>
          field.id === editingField.id ? { ...field, placeholder: editingPlaceholder } : field
        )
      );
      
      setEditingField(null);
      setEditingPlaceholder('');
      toast.success('تم تحديث وصف الحقل بنجاح');
    } catch (error) {
      console.error('Error updating field placeholder:', error);
      toast.error('فشل في تحديث وصف الحقل');
    }
  };

  const handleDeleteField = async (id: string | number) => {
    const fieldId = String(id);
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الحقل؟')) {
      try {
        await deleteSiteField(fieldId);
        setFields(prevFields => prevFields.filter(field => field.id !== fieldId));
        toast.success('تم حذف الحقل بنجاح');
      } catch (error) {
        console.error('Error deleting field:', error);
        toast.error('فشل في حذف الحقل');
      }
    }
  };

  const handleCreateField = async (e: FormEvent) => {
    e.preventDefault();
    if (!fieldName || !displayName) {
      toast.error('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    const newField = {
      field_name: fieldName,
      display_name: displayName,
      placeholder: placeholder,
      is_required: isRequired,
      is_active: true,
      sort_order: fields.length + 1
    };

    try {
      const result = await createSiteField(newField);
      console.log("Create field result:", result);

      if (result && result.success && result.data) {
        setFields([...fields, result.data[0] as SiteField]);
        setFieldName('');
        setDisplayName('');
        setPlaceholder('');
        setIsRequired(false);
        toast.success('تم إنشاء الحقل بنجاح');
      } else {
        console.error('Error in create field response:', result);
        toast.error('فشل في إنشاء الحقل');
      }
    } catch (error) {
      console.error('Error creating field:', error);
      toast.error('فشل في إنشاء الحقل');
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFields(items);

    const updates = items.map((field, index) => ({
      id: String(field.id),
      sort_order: index + 1
    }));

    try {
      const success = await updateFieldOrder(updates);
      if (!success) {
        toast.error('فشل في تحديث ترتيب الحقول في قاعدة البيانات. يرجى التحديث.');
        fetchFields();
        return;
      }
      toast.success('تم تحديث ترتيب الحقول بنجاح');
    } catch (error) {
      console.error('Error updating field order:', error);
      toast.error('فشل في تحديث ترتيب الحقول. يرجى التحديث.');
      fetchFields();
    }
  };

  const moveUp = async (index: number, id: string | number) => {
    if (index > 0) {
      const newFields = [...fields];
      const temp = newFields[index];
      newFields[index] = newFields[index - 1];
      newFields[index - 1] = temp;

      setFields(newFields);

      const updates = newFields.map((field, i) => ({
        id: String(field.id),
        sort_order: i + 1
      }));

      try {
        const success = await updateFieldOrder(updates);
        if (!success) {
          toast.error('فشل في تحديث ترتيب الحقول في قاعدة البيانات. يرجى التحديث.');
          fetchFields();
          return;
        }
        toast.success('تم تحديث ترتيب الحقول بنجاح');
      } catch (error) {
        console.error('Error updating field order:', error);
        toast.error('فشل في تحديث ترتيب الحقول. يرجى التحديث.');
        fetchFields();
      }
    }
  };

  const moveDown = async (index: number, id: string | number) => {
    if (index < fields.length - 1) {
      const newFields = [...fields];
      const temp = newFields[index];
      newFields[index] = newFields[index + 1];
      newFields[index + 1] = temp;

      setFields(newFields);

      const updates = newFields.map((field, i) => ({
        id: String(field.id),
        sort_order: i + 1
      }));

      try {
        const success = await updateFieldOrder(updates);
        if (!success) {
          toast.error('فشل في تحديث ترتيب الحقول في قاعدة البيانات. يرجى التحديث.');
          fetchFields();
          return;
        }
        toast.success('تم تحديث ترتيب الحقول بنجاح');
      } catch (error) {
        console.error('Error updating field order:', error);
        toast.error('فشل في تحديث ترتيب الحقول. يرجى التحديث.');
        fetchFields();
      }
    }
  };

  const updateSystemField = async (fieldName: string, displayName: string) => {
    if (!displayName) {
      toast.error('الرجاء إدخال اسم للحقل');
      return;
    }
    
    try {
      const result = await updateSystemFieldName(fieldName, displayName);
      
      // Fix: Check if result is truthy/success without assuming it has a success property
      if (result) {
        setFields(prevFields =>
          prevFields.map(field =>
            field.field_name === fieldName ? { ...field, display_name: displayName } : field
          )
        );

        toast.success('تم تحديث الحقل النظامي بنجاح');
        setEditingSystemField('');
      } else {
        throw new Error('فشل في تحديث الحقل النظامي');
      }
    } catch (error) {
      console.error('Error updating system field:', error);
      toast.error('فشل في تحديث الحقل النظامي');
    }
  };

  const openPlaceholderDialog = (field: SiteField) => {
    setEditingField(field);
    setEditingPlaceholder(field.placeholder || '');
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="border-company/20 glass">
        <CardHeader>
          <CardTitle className="text-2xl text-right">إدارة حقول الموقع</CardTitle>
          <CardDescription className="text-right">تخصيص الحقول المتاحة في نموذج الدعم.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchFields} disabled={loading} className="mb-4">
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                جاري التحميل...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                تحديث الحقول
              </>
            )}
          </Button>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {fields.map((field, index) => (
                    <Draggable key={field.id} draggableId={String(field.id)} index={index}>
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white rounded-md shadow-sm p-4 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold">{field.display_name}</div>
                            <div className="text-sm text-gray-500">{field.field_name}</div>
                            {field.placeholder && (
                              <div className="text-xs text-gray-400 mt-1">
                                وصف: {field.placeholder}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* All fields (system & custom) can have placeholder text */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="icon" 
                                  variant="outline" 
                                  onClick={() => openPlaceholderDialog(field)} 
                                  title="تحرير وصف الحقل"
                                >
                                  <Type className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle className="text-right">تحرير وصف الحقل</DialogTitle>
                                  <DialogDescription className="text-right">
                                    أضف نصًا توضيحيًا يظهر داخل الحقل لمساعدة المستخدم.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="fieldPlaceholder" className="text-right">
                                      نص توضيحي للحقل {field.display_name}
                                    </Label>
                                    <Textarea
                                      id="fieldPlaceholder"
                                      value={editingPlaceholder}
                                      onChange={(e) => setEditingPlaceholder(e.target.value)}
                                      placeholder="أدخل نصًا توضيحيًا يظهر داخل الحقل..."
                                      className="text-right min-h-[100px]"
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button type="submit" onClick={handleUpdatePlaceholder}>حفظ</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            {!SYSTEM_FIELDS.includes(field.field_name) ? (
                              <>
                                <Button size="icon" onClick={() => moveUp(index, field.id)} title="نقل لأعلى">
                                  <ArrowUp className="h-4 w-4" />
                                </Button>
                                <Button size="icon" onClick={() => moveDown(index, field.id)} title="نقل لأسفل">
                                  <ArrowDown className="h-4 w-4" />
                                </Button>
                                <Switch
                                  id={`active-${field.id}`}
                                  checked={field.is_active}
                                  onCheckedChange={() => handleToggleActive(field.id)}
                                />
                                <Label htmlFor={`active-${field.id}`} className="text-sm ml-2">
                                  مفعل
                                </Label>
                                <Switch
                                  id={`required-${field.id}`}
                                  checked={field.is_required}
                                  onCheckedChange={() => handleToggleRequired(field.id)}
                                />
                                <Label htmlFor={`required-${field.id}`} className="text-sm ml-2">
                                  مطلوب
                                </Label>
                                <Button size="icon" onClick={() => handleRenameField(field.id)} title="تعديل">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="destructive" onClick={() => handleDeleteField(field.id)} title="حذف">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                {editingSystemField === field.field_name ? (
                                  <div className="flex items-center space-x-2">
                                    <Input
                                      type="text"
                                      value={newDisplayName}
                                      onChange={(e) => setNewDisplayName(e.target.value)}
                                      placeholder="الاسم المعروض الجديد"
                                      className="text-right"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        updateSystemField(field.field_name, newDisplayName);
                                      }}
                                    >
                                      حفظ
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditingSystemField('')}>
                                      إلغاء
                                    </Button>
                                  </div>
                                ) : (
                                  <Button size="icon" onClick={() => {
                                    setEditingSystemField(field.field_name);
                                    setNewDisplayName(field.display_name);
                                  }}
                                  title="تعديل"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>

          <form onSubmit={handleCreateField} className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
            <h3 className="text-lg font-medium text-right mb-4">إضافة حقل جديد</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="fieldName" className="text-right block">اسم الحقل</Label>
                <Input
                  type="text"
                  id="fieldName"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  className="text-right"
                  placeholder="اسم الحقل البرمجي"
                />
              </div>
              <div>
                <Label htmlFor="displayName" className="text-right block">الاسم المعروض</Label>
                <Input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="text-right"
                  placeholder="الاسم الذي سيظهر للمستخدم"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <Label htmlFor="placeholder" className="text-right block">النص التوضيحي (Placeholder)</Label>
              <Textarea
                id="placeholder"
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                className="text-right"
                placeholder="أدخل نصًا توضيحيًا يظهر داخل الحقل..."
              />
            </div>
            
            <div className="flex items-center justify-end mb-4">
              <Label htmlFor="isRequired" className="ml-2">
                مطلوب
              </Label>
              <Switch id="isRequired" checked={isRequired} onCheckedChange={setIsRequired} />
            </div>
            
            <Button type="submit" className="w-full">
              <Plus className="ml-2 h-4 w-4" />
              إنشاء حقل
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteFieldsManager;

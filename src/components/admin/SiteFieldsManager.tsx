
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
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { RefreshCw, Plus, Pencil, Trash, ArrowUp, ArrowDown } from 'lucide-react';

const SiteFieldsManager = () => {
  const [fields, setFields] = useState<SiteField[]>([]);
  const [loading, setLoading] = useState(true);
  const [fieldName, setFieldName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [isSystemField, setIsSystemField] = useState(false);
  const [editingSystemField, setEditingSystemField] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');

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
      toast.error('يرجى تعبئة جميع الحقول');
      return;
    }

    const newField = {
      field_name: fieldName,
      display_name: displayName,
      is_required: isRequired,
      is_active: true,
      field_type: 'text'
    };

    try {
      const result = await createSiteField(newField);

      if (result.success && result.data) {
        setFields([...fields, result.data[0] as SiteField]);
        setFieldName('');
        setDisplayName('');
        setIsRequired(false);
        toast.success('تم إنشاء الحقل بنجاح');
      } else {
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

    // Optimistically update the state
    setFields(items);

    // Prepare updates for the database
    const updates = items.map((field, index) => ({
      id: String(field.id),
      sort_order: index + 1
    }));

    try {
      const success = await updateFieldOrder(updates);
      if (!success) {
        toast.error('فشل في تحديث ترتيب الحقول في قاعدة البيانات. يرجى التحديث.');
        // Revert to the original order in case of failure
        fetchFields();
        return;
      }
      toast.success('تم تحديث ترتيب الحقول بنجاح');
    } catch (error) {
      console.error('Error updating field order:', error);
      toast.error('فشل في تحديث ترتيب الحقول. يرجى التحديث.');
      // Revert to the original order in case of failure
      fetchFields();
    }
  };

  const moveUp = async (index: number, id: string | number) => {
    if (index > 0) {
      const newFields = [...fields];
      const temp = newFields[index];
      newFields[index] = newFields[index - 1];
      newFields[index - 1] = temp;

      // Optimistically update the state
      setFields(newFields);

      // Prepare updates for the database
      const updates = newFields.map((field, i) => ({
        id: String(field.id),
        sort_order: i + 1
      }));

      try {
        const success = await updateFieldOrder(updates);
        if (!success) {
          toast.error('فشل في تحديث ترتيب الحقول في قاعدة البيانات. يرجى التحديث.');
          // Revert to the original order in case of failure
          fetchFields();
          return;
        }
        toast.success('تم تحديث ترتيب الحقول بنجاح');
      } catch (error) {
        console.error('Error updating field order:', error);
        toast.error('فشل في تحديث ترتيب الحقول. يرجى التحديث.');
        // Revert to the original order in case of failure
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

      // Optimistically update the state
      setFields(newFields);

      // Prepare updates for the database
      const updates = newFields.map((field, i) => ({
        id: String(field.id),
        sort_order: i + 1
      }));

      try {
        const success = await updateFieldOrder(updates);
        if (!success) {
          toast.error('فشل في تحديث ترتيب الحقول في قاعدة البيانات. يرجى التحديث.');
          // Revert to the original order in case of failure
          fetchFields();
          return;
        }
        toast.success('تم تحديث ترتيب الحقول بنجاح');
      } catch (error) {
        console.error('Error updating field order:', error);
        toast.error('فشل في تحديث ترتيب الحقول. يرجى التحديث.');
        // Revert to the original order in case of failure
        fetchFields();
      }
    }
  };

  const updateSystemField = async (fieldName: string, displayName: string) => {
    try {
      await updateSystemFieldName(fieldName, fieldName, displayName);

      // Update local state
      setFields(prevFields =>
        prevFields.map(field =>
          field.field_name === fieldName ? { ...field, display_name: displayName } : field
        )
      );

      toast.success('تم تحديث الحقل النظامي بنجاح');
    } catch (error) {
      console.error('Error updating system field:', error);
      toast.error('فشل في تحديث الحقل النظامي');
    }
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
                          </div>
                          <div className="flex items-center space-x-2">
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
                                        setEditingSystemField('');
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

          <form onSubmit={handleCreateField} className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="flex items-center justify-end">
                <Label htmlFor="isRequired" className="ml-2">
                  مطلوب
                </Label>
                <Switch id="isRequired" checked={isRequired} onCheckedChange={setIsRequired} />
              </div>
            </div>
            <Button type="submit" className="mt-4">
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

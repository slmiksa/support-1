
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
      toast.error('Failed to load site fields');
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
        toast.error('Field not found');
        return;
      }

      await updateSiteField(fieldId, { is_required: !fieldToUpdate.is_required });
      setFields(prevFields =>
        prevFields.map(field =>
          field.id === fieldId ? { ...field, is_required: !field.is_required } : field
        )
      );
      toast.success('Required status updated');
    } catch (error) {
      console.error('Error toggling required status:', error);
      toast.error('Failed to update required status');
    }
  };

  const handleToggleActive = async (id: string | number) => {
    const fieldId = String(id);
    try {
      const fieldToUpdate = fields.find(field => field.id === fieldId);
      if (!fieldToUpdate) {
        console.error('Field not found:', fieldId);
        toast.error('Field not found');
        return;
      }

      await updateSiteField(fieldId, { is_active: !fieldToUpdate.is_active });
      setFields(prevFields =>
        prevFields.map(field =>
          field.id === fieldId ? { ...field, is_active: !field.is_active } : field
        )
      );
      toast.success('Active status updated');
    } catch (error) {
      console.error('Error toggling active status:', error);
      toast.error('Failed to update active status');
    }
  };

  const handleRenameField = async (id: string | number) => {
    const fieldId = String(id);
    try {
      const fieldToUpdate = fields.find(field => field.id === fieldId);
      if (!fieldToUpdate) {
        console.error('Field not found:', fieldId);
        toast.error('Field not found');
        return;
      }

      const newDisplayName = prompt('Enter new display name:', fieldToUpdate.display_name);
      if (newDisplayName && newDisplayName !== fieldToUpdate.display_name) {
        await updateSiteField(fieldId, { display_name: newDisplayName });
        setFields(prevFields =>
          prevFields.map(field =>
            field.id === fieldId ? { ...field, display_name: newDisplayName } : field
          )
        );
        toast.success('Display name updated');
      }
    } catch (error) {
      console.error('Error renaming field:', error);
      toast.error('Failed to update display name');
    }
  };

  const handleDeleteField = async (id: string | number) => {
    const fieldId = String(id);
    if (window.confirm('Are you sure you want to delete this field?')) {
      try {
        await deleteSiteField(fieldId);
        setFields(prevFields => prevFields.filter(field => field.id !== fieldId));
        toast.success('Field deleted successfully');
      } catch (error) {
        console.error('Error deleting field:', error);
        toast.error('Failed to delete field');
      }
    }
  };

  const handleCreateField = async (e: FormEvent) => {
    e.preventDefault();
    if (!fieldName || !displayName) {
      toast.error('Please fill in all fields');
      return;
    }

    const newField = {
      field_name: fieldName,
      display_name: displayName,
      is_required: isRequired,
      is_active: true,
      field_type: 'text' // Add the required field_type
    };

    try {
      const result = await createSiteField(newField);

      if (result.success && result.data) {
        setFields([...fields, result.data[0] as SiteField]);
        setFieldName('');
        setDisplayName('');
        setIsRequired(false);
        toast.success('Field created successfully');
      } else {
        toast.error('Failed to create field');
      }
    } catch (error) {
      console.error('Error creating field:', error);
      toast.error('Failed to create field');
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
        toast.error('Failed to update field order in database. Please refresh.');
        // Revert to the original order in case of failure
        fetchFields();
        return;
      }
      toast.success('Field order updated successfully');
    } catch (error) {
      console.error('Error updating field order:', error);
      toast.error('Failed to update field order. Please refresh.');
      // Revert to the original order in case of failure
      fetchFields();
    }
  };

  const moveUp = async (index: number, id: string | number) => {
    const fieldId = String(id);
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
          toast.error('Failed to update field order in database. Please refresh.');
          // Revert to the original order in case of failure
          fetchFields();
          return;
        }
        toast.success('Field order updated successfully');
      } catch (error) {
        console.error('Error updating field order:', error);
        toast.error('Failed to update field order. Please refresh.');
        // Revert to the original order in case of failure
        fetchFields();
      }
    }
  };

  const moveDown = async (index: number, id: string | number) => {
    const fieldId = String(id);
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
          toast.error('Failed to update field order in database. Please refresh.');
          // Revert to the original order in case of failure
          fetchFields();
          return;
        }
        toast.success('Field order updated successfully');
      } catch (error) {
        console.error('Error updating field order:', error);
        toast.error('Failed to update field order. Please refresh.');
        // Revert to the original order in case of failure
        fetchFields();
      }
    }
  };

  const updateSystemField = async (fieldName: string, displayName: string, customField: boolean = false) => {
    try {
      await updateSystemFieldName(fieldName, fieldName, displayName);

      // Update local state
      setFields(prevFields =>
        prevFields.map(field =>
          field.field_name === fieldName ? { ...field, display_name: displayName } : field
        )
      );

      // Update SYSTEM_FIELD_LABELS in constants.ts (if needed)
      // This depends on how you're using SYSTEM_FIELD_LABELS in your application
      // If it's directly imported and used, you might need to refresh the page
      // or use a more dynamic approach to update it.

      toast.success('System field updated successfully');
    } catch (error) {
      console.error('Error updating system field:', error);
      toast.error('Failed to update system field');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="border-company/20 glass">
        <CardHeader>
          <CardTitle className="text-2xl">Manage Site Fields</CardTitle>
          <CardDescription>Customize the fields available in the support form.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchFields} disabled={loading} className="mb-4">
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Fields
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
                                <Button size="icon" onClick={() => moveUp(index, field.id)}>
                                  <ArrowUp className="h-4 w-4" />
                                </Button>
                                <Button size="icon" onClick={() => moveDown(index, field.id)}>
                                  <ArrowDown className="h-4 w-4" />
                                </Button>
                                <Switch
                                  id={`active-${field.id}`}
                                  checked={field.is_active}
                                  onCheckedChange={() => handleToggleActive(field.id)}
                                />
                                <Label htmlFor={`active-${field.id}`} className="text-sm">
                                  Active
                                </Label>
                                <Switch
                                  id={`required-${field.id}`}
                                  checked={field.is_required}
                                  onCheckedChange={() => handleToggleRequired(field.id)}
                                />
                                <Label htmlFor={`required-${field.id}`} className="text-sm">
                                  Required
                                </Label>
                                <Button size="icon" onClick={() => handleRenameField(field.id)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="destructive" onClick={() => handleDeleteField(field.id)}>
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
                                      placeholder="New Display Name"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        updateSystemField(field.field_name, newDisplayName);
                                        setEditingSystemField('');
                                      }}
                                    >
                                      Save
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditingSystemField('')}>
                                      Cancel
                                    </Button>
                                  </div>
                                ) : (
                                  <Button size="icon" onClick={() => {
                                    setEditingSystemField(field.field_name);
                                    setNewDisplayName(field.display_name);
                                  }}>
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
                <Label htmlFor="fieldName">Field Name</Label>
                <Input
                  type="text"
                  id="fieldName"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div className="flex items-center">
                <Label htmlFor="isRequired" className="mr-2">
                  Required
                </Label>
                <Switch id="isRequired" checked={isRequired} onCheckedChange={setIsRequired} />
              </div>
            </div>
            <Button type="submit" className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create Field
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteFieldsManager;

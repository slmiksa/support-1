
import * as XLSX from 'exceljs';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { Branch } from '@/types';
import { BranchResourceType } from '@/types';

export const exportBranchResourcesToExcel = async (
  branches: Branch[],
  branchResourceTypes: BranchResourceType[]
) => {
  const workbook = new XLSX.Workbook();
  const worksheet = workbook.addWorksheet('موارد الفروع');

  // تعيين اتجاه الورقة من اليمين إلى اليسار
  worksheet.views = [{ rightToLeft: true }];

  // إضافة العناوين
  worksheet.columns = [
    { header: 'الفرع', key: 'branch', width: 20 },
    { header: 'نوع المورد', key: 'resourceType', width: 20 },
    { header: 'المتوفر', key: 'available', width: 15 },
    { header: 'المستخدم', key: 'inUse', width: 15 }
  ];

  // إضافة البيانات
  branches.forEach(branch => {
    const branchResources = branchResourceTypes.filter(
      resource => resource.branch_id === branch.id
    );

    branchResources.forEach(resource => {
      worksheet.addRow({
        branch: branch.name,
        resourceType: resource.resource_type?.name,
        available: resource.available,
        inUse: resource.in_use
      });
    });

    // إضافة صف فارغ بين الفروع
    worksheet.addRow({});
  });

  // تنسيق الجدول
  worksheet.getRows(1, worksheet.rowCount)?.forEach(row => {
    row.eachCell(cell => {
      cell.alignment = { horizontal: 'right' };
      cell.font = { name: 'Arial' };
    });
  });

  // تنسيق صف العناوين
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell(cell => {
    cell.font = { bold: true, size: 12, name: 'Arial' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD4AF37' }  // لون ذهبي
    };
  });

  // حفظ الملف
  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `تقرير_موارد_الفروع_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  saveAs(new Blob([buffer]), fileName);
};

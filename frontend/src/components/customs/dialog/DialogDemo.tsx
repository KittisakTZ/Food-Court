// @/components/customs/dialog/DialogDemo.tsx
// ตัวอย่างการใช้งาน Modern Dialog

import { useState } from 'react';
import { ModernDialog, DialogType } from './ModernDialog';
import { dialogService } from '@/services/dialog.service';

export const DialogDemo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogType, setDialogType] = useState<DialogType>('confirm');

  const handleOpenDialog = (type: DialogType) => {
    setDialogType(type);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    console.log('Confirmed!');
  };

  // ตัวอย่างการใช้ Service
  const handleServiceConfirm = async () => {
    const confirmed = await dialogService.confirm({
      title: 'ยืนยันการดำเนินการ',
      description: 'คุณแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?',
      type: 'confirm',
      confirmText: 'ยืนยัน',
      cancelText: 'ยกเลิก'
    });

    if (confirmed) {
      await dialogService.success('สำเร็จ!', 'การดำเนินการเสร็จสมบูรณ์');
    }
  };

  const handleServiceError = async () => {
    await dialogService.error(
      'เกิดข้อผิดพลาด',
      'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง'
    );
  };

  const handleServiceWarning = async () => {
    await dialogService.warning(
      'คำเตือน',
      'การกระทำนี้อาจส่งผลกระทบต่อระบบ กรุณาตรวจสอบให้แน่ใจก่อนดำเนินการ'
    );
  };

  const handleServiceInfo = async () => {
    await dialogService.info(
      'ข้อมูลสำคัญ',
      'ระบบจะปิดปรับปรุงในวันที่ 25 ธันวาคม 2024 เวลา 02:00-04:00 น.'
    );
  };

  const titles = {
    confirm: 'ยืนยันการดำเนินการ',
    alert: 'ข้อความแจ้งเตือน',
    success: 'สำเร็จ!',
    error: 'เกิดข้อผิดพลาด',
    warning: 'คำเตือน',
    info: 'ข้อมูลสำคัญ',
  };

  const descriptions = {
    confirm: 'คุณแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?',
    alert: 'นี่คือข้อความแจ้งเตือนทั่วไป',
    success: 'การดำเนินการเสร็จสมบูรณ์แล้ว',
    error: 'ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง',
    warning: 'การกระทำนี้อาจส่งผลกระทบต่อระบบ',
    info: 'นี่คือข้อมูลสำคัญที่คุณควรทราบ',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Modern Dialog Demo</h1>

        {/* Component-based Examples */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">1. Component-based (State)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(['confirm', 'alert', 'success', 'error', 'warning', 'info'] as DialogType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleOpenDialog(type)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Service-based Examples */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">2. Service-based (Programmatic)</h2>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <button
              onClick={handleServiceConfirm}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
            >
              Confirm Dialog
            </button>
            <button
              onClick={handleServiceError}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-rose-700 transition-all shadow-md hover:shadow-lg"
            >
              Error Dialog
            </button>
            <button
              onClick={handleServiceWarning}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
            >
              Warning Dialog
            </button>
            <button
              onClick={handleServiceInfo}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              Info Dialog
            </button>
          </div>
        </div>

        {/* Code Example */}
        <div className="bg-slate-900 rounded-2xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Code Example</h2>
          <pre className="text-green-400 text-sm overflow-x-auto">
{`// Using Service
const confirmed = await dialogService.confirm({
  title: 'ยืนยันการดำเนินการ',
  description: 'คุณแน่ใจหรือไม่?',
  type: 'confirm'
});

if (confirmed) {
  await dialogService.success('สำเร็จ!', 'เสร็จสิ้น');
}

// Using Component
<ModernDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleConfirm}
  title="ยืนยันการลบ"
  description="คุณแน่ใจหรือไม่?"
  type="warning"
/>`}
          </pre>
        </div>
      </div>

      {/* Dialog Component */}
      <ModernDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title={titles[dialogType]}
        description={descriptions[dialogType]}
        type={dialogType}
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        hideCancel={dialogType === 'alert' || dialogType === 'success' || dialogType === 'error'}
      />
    </div>
  );
};

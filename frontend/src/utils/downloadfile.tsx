export const downloadFIle = async (url: string, name: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย");
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์:", error);
  }
};

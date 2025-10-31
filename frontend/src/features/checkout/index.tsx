// @/features/checkout/index.tsx

import { useCartStore } from "@/zustand/useCartStore";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { createOrder } from "@/services/order.service";
import { toastService } from "@/services/toast.service";

const CheckoutFeature = () => {
  const cart = useCartStore((state) => state.cart);
  const totalPrice = useMemo(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce(
      (total, item) => total + item.menu.price * item.quantity,
      0
    );
  }, [cart]);

  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [pickupOption, setPickupOption] = useState<"asap" | "scheduled">("asap");
  const [pickupTime, setPickupTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return <div>กำลังเปลี่ยนหน้าไปยังหน้าล็อกอิน...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto text-center py-16">
        <h1 className="text-3xl font-bold text-gray-800">ตะกร้าของคุณว่างเปล่า 🍽️</h1>
        <p className="text-gray-600 mt-3">ยังไม่มีเมนูที่เลือกไว้ ลองเลือกอาหารที่ชอบสิ!</p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition"
        >
          กลับไปเลือกร้านอาหาร
        </button>
      </div>
    );
  }

  const handleConfirmOrder = async () => {
    if (!cart.storeId) return;
    setIsSubmitting(true);

    const payload = {
      storeId: cart.storeId,
      items: cart.items.map((item) => ({
        menuId: item.menu.id,
        quantity: item.quantity,
      })),
      scheduledPickupTime: pickupOption === "scheduled" ? pickupTime : undefined,
    };

    try {
      const response = await createOrder(payload);
      if (response.statusCode === 201) {
        toastService.success("สั่งอาหารสำเร็จ 🎉 สามารถตรวจสอบได้ที่ 'รายการของฉัน'");
        navigate("/my-orders");
      } else {
        toastService.error(`เกิดข้อผิดพลาด: ${response.message}`);
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null) {
        console.error("Error logging in:", error);
        toastService.error(
          (error as { response?: { data?: { message: string } } }).response
            ?.data?.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-green-700 flex items-center gap-2">
        ✅ ยืนยันการสั่งอาหาร
      </h1>

      {/* สรุปรายการอาหาร */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-green-100 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-green-700">
          🍛 รายการอาหารของคุณ
        </h2>
        <div className="divide-y divide-gray-200">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center py-3"
            >
              <div>
                <p className="font-semibold text-gray-800">{item.menu.name}</p>
                <p className="text-sm text-gray-500">
                  ฿{item.menu.price.toFixed(2)} x {item.quantity}
                </p>
              </div>
              <span className="font-medium text-green-600">
                ฿{(item.menu.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 flex justify-between font-bold text-lg border-t border-gray-200">
          <span>รวมทั้งหมด:</span>
          <span className="text-green-700">฿{totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* ตัวเลือกเวลา */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
        <h2 className="text-xl font-semibold mb-4 text-blue-700">
          ⏰ เลือกเวลารับอาหาร
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex items-center p-3 border rounded-lg cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 transition">
            <input
              type="radio"
              name="pickupOption"
              value="asap"
              checked={pickupOption === "asap"}
              onChange={() => setPickupOption("asap")}
              className="mr-2 accent-blue-500"
            />
            รับทันที (As soon as possible)
          </label>
          <label className="flex items-center p-3 border rounded-lg cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 transition">
            <input
              type="radio"
              name="pickupOption"
              value="scheduled"
              checked={pickupOption === "scheduled"}
              onChange={() => setPickupOption("scheduled")}
              className="mr-2 accent-blue-500"
            />
            จองเวลารับอาหาร (Schedule)
          </label>
        </div>

        {pickupOption === "scheduled" && (
          <div className="mt-4">
            <label
              htmlFor="pickupTime"
              className="block text-sm font-medium text-gray-700"
            >
              เลือกเวลารับอาหาร (24 ชั่วโมง):
            </label>
            <input
              type="time"
              id="pickupTime"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* ปุ่มยืนยัน */}
      <button
        onClick={handleConfirmOrder}
        disabled={isSubmitting}
        className="w-full mt-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg rounded-full transition disabled:bg-gray-400"
      >
        {isSubmitting ? "กำลังสั่งอาหาร..." : "ยืนยันการสั่งอาหาร"}
      </button>
    </div>
  );
};

export default CheckoutFeature;

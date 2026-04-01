// @/features/checkout/index.tsx

import { useCartStore } from "@/zustand/useCartStore";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useCreateOrder } from "@/hooks/useOrders";
import { toastService } from "@/services/toast.service";
import { FiShoppingBag, FiClock, FiCheckCircle, FiChevronLeft, FiCalendar, FiZap, FiDollarSign } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import { BiDish, BiTime } from "react-icons/bi";
import { NO_FOOD_IMAGE, onImgError } from "@/utils/imageUtils";

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
  const [pickupHour, setPickupHour] = useState("");
  const [pickupMinute, setPickupMinute] = useState("10");
  const [paymentMethod, setPaymentMethod] = useState<'PROMPTPAY' | 'CASH_ON_PICKUP'>('PROMPTPAY');
  const [description, setDescription] = useState(""); // Add this line
  const { mutate: placeOrder, isPending: isSubmitting } = useCreateOrder();

  // Get current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toISOString().split('T')[0],
      hour: now.getHours(),
      minute: now.getMinutes()
    };
  };

  // Generate available hours based on current time
  const getAvailableHours = () => {
    const currentHour = getCurrentDateTime().hour;
    const hours = [];
    for (let i = currentHour; i < 24; i++) {
      hours.push(i.toString().padStart(2, '0'));
    }
    return hours;
  };

  // Generate available minutes
  const availableMinutes = ["10", "20", "30", "40", "50"];

  // Get available minutes based on selected hour
  const getAvailableMinutes = () => {
    if (!pickupHour) return availableMinutes;

    const current = getCurrentDateTime();
    const selectedHour = parseInt(pickupHour);

    // If selected hour is current hour, filter out past minutes
    if (selectedHour === current.hour) {
      return availableMinutes.filter(min => parseInt(min) > current.minute);
    }

    return availableMinutes;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleConfirmOrder = async () => {
    if (!cart.storeId) return;

    // ตรวจสอบว่าเวลาที่เลือกไม่เป็นเวลาในอดีต
    if (pickupOption === 'scheduled' && pickupHour && pickupMinute) {
      const now = new Date();
      const selectedDateTime = new Date();
      selectedDateTime.setHours(parseInt(pickupHour), parseInt(pickupMinute), 0, 0);

      if (selectedDateTime <= now) {
        toastService.error("กรุณาเลือกเวลาที่อยู่ในอนาคต ⏰");
        return;
      }
    }

    const payload = {
      storeId: cart.storeId,
      items: cart.items.map(item => ({ menuId: item.menu.id, quantity: item.quantity })),
      scheduledPickupTime: pickupOption === 'scheduled' ? `${pickupHour}:${pickupMinute}` : undefined,
      paymentMethod: paymentMethod, // <-- เช็คว่าบรรทัดนี้ถูกเพิ่มเข้าไปใน Object payload แล้ว
      description: description, // Add this line
    };

    placeOrder(payload, {
      onSuccess: () => {
        toastService.success("สั่งอาหารสำเร็จ! ตรวจสอบสถานะได้ที่ 'คำสั่งซื้อของฉัน' ✅");
        navigate('/my-orders');
      },
    });
  };

  // Loading/Redirect State
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-8 border-orange-200 border-t-orange-500 mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <FiCheckCircle className="w-8 h-8 text-orange-500 animate-pulse" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-700 animate-pulse">กำลังเปลี่ยนหน้า...</p>
        </div>
      </div>
    );
  }

  // Empty Cart State
  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-12 rounded-3xl shadow-2xl border-2 border-orange-200 max-w-md animate-fade-in">
          <div className="relative inline-block mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto">
              <FiShoppingBag className="w-16 h-16 text-orange-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl animate-bounce">
              <span className="text-white text-2xl font-bold">!</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">ตะกร้าว่างเปล่า 🍽️</h1>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            ยังไม่มีเมนูที่เลือกไว้<br />ลองเลือกอาหารที่ชอบสิ!
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-full hover:from-orange-600 hover:to-yellow-600 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            <FiChevronLeft className="w-5 h-5" />
            กลับไปเลือกร้านอาหาร
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 py-8">
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-white border-2 border-orange-200 rounded-2xl hover:border-orange-400 hover:bg-orange-50 transition-all shadow-md hover:shadow-xl font-semibold text-gray-700 group animate-fade-in"
        >
          <FiChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          กลับ
        </button>

        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden animate-fade-in">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <FiCheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold flex items-center gap-3">
                  ยืนยันการสั่งอาหาร
                  <HiSparkles className="w-8 h-8 animate-spin-slow" />
                </h1>
                <p className="text-green-100 text-lg mt-2">
                  เช็ครายการและเลือกเวลารับอาหาร
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-orange-100 overflow-hidden animate-fade-in-up">
              <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-6 border-b-2 border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-md">
                    <BiDish className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    รายการอาหารของคุณ
                    <span className="text-lg bg-orange-500 text-white px-3 py-1 rounded-full">
                      {cart.items.length} รายการ
                    </span>
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {cart.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border-2 border-orange-100 hover:border-orange-300 transition-all hover:shadow-lg group animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Menu Image */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow flex-shrink-0">
                        <img
                          src={item.menu.image || NO_FOOD_IMAGE}
                          alt={item.menu.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={onImgError(NO_FOOD_IMAGE)}
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-grow min-w-0">
                        <p className="font-bold text-gray-800 text-lg truncate group-hover:text-orange-600 transition-colors">
                          {item.menu.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          ฿{item.menu.price.toFixed(0)} × {item.quantity}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <span className="text-2xl font-bold text-green-600">
                          ฿{(item.menu.price * item.quantity).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pickup Time Options */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-blue-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-6 border-b-2 border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                    <FiClock className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    เลือกเวลารับอาหาร ⏰
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* ASAP Option */}
                  <label className={`relative cursor-pointer group transition-all ${pickupOption === "asap" ? "scale-105" : ""
                    }`}>
                    <input
                      type="radio"
                      name="pickupOption"
                      value="asap"
                      checked={pickupOption === "asap"}
                      onChange={() => setPickupOption("asap")}
                      className="peer sr-only"
                    />
                    <div className="p-6 border-2 rounded-2xl transition-all peer-checked:border-orange-500 peer-checked:bg-gradient-to-br peer-checked:from-orange-50 peer-checked:to-yellow-50 hover:border-orange-300 hover:shadow-lg group-hover:scale-105">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-xl flex items-center justify-center shadow-md peer-checked:animate-bounce-slow">
                          <FiZap className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-lg">รับทันที</p>
                          <p className="text-sm text-gray-600">As soon as possible</p>
                        </div>
                      </div>
                      {pickupOption === "asap" && (
                        <div className="mt-4 flex items-center gap-2 text-orange-600 font-semibold animate-fade-in">
                          <FiCheckCircle className="w-5 h-5" />
                          เลือกแล้ว
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Scheduled Option */}
                  <label className={`relative cursor-pointer group transition-all ${pickupOption === "scheduled" ? "scale-105" : ""
                    }`}>
                    <input
                      type="radio"
                      name="pickupOption"
                      value="scheduled"
                      checked={pickupOption === "scheduled"}
                      onChange={() => setPickupOption("scheduled")}
                      className="peer sr-only"
                    />
                    <div className="p-6 border-2 rounded-2xl transition-all peer-checked:border-blue-500 peer-checked:bg-gradient-to-br peer-checked:from-blue-50 peer-checked:to-cyan-50 hover:border-blue-300 hover:shadow-lg group-hover:scale-105">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-md peer-checked:animate-bounce-slow">
                          <FiCalendar className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-lg">จองเวลา</p>
                          <p className="text-sm text-gray-600">Schedule pickup</p>
                        </div>
                      </div>
                      {pickupOption === "scheduled" && (
                        <div className="mt-4 flex items-center gap-2 text-blue-600 font-semibold animate-fade-in">
                          <FiCheckCircle className="w-5 h-5" />
                          เลือกแล้ว
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                {/* Time Picker */}
                {pickupOption === "scheduled" && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200 animate-slide-down space-y-4">
                    {/* Current Date Display */}
                    <div className="bg-white p-4 rounded-xl border-2 border-blue-300">
                      <p className="text-sm text-gray-600 mb-1">วันที่รับอาหาร:</p>
                      <p className="text-lg font-bold text-blue-600 flex items-center gap-2">
                        <FiCalendar className="w-5 h-5" />
                        📅 {new Date().toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long'
                        })} (วันนี้)
                      </p>
                    </div>

                    {/* Hour Picker */}
                    <div>
                      <label
                        htmlFor="pickupHour"
                        className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3"
                      >
                        <BiTime className="w-6 h-6 text-blue-500" />
                        เลือกชั่วโมง:
                      </label>
                      <select
                        id="pickupHour"
                        value={pickupHour}
                        onChange={(e) => {
                          setPickupHour(e.target.value);
                          const availableMins = getAvailableMinutes();
                          if (!availableMins.includes(pickupMinute)) {
                            setPickupMinute(availableMins[0] || "10");
                          }
                        }}
                        className="w-full px-5 py-4 text-lg border-2 border-blue-300 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                      >
                        <option value="">-- เลือกชั่วโมง --</option>
                        {getAvailableHours().map(hour => (
                          <option key={hour} value={hour}>
                            {hour}:00 น.
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Minute Picker */}
                    <div>
                      <label
                        htmlFor="pickupMinute"
                        className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3"
                      >
                        <BiTime className="w-6 h-6 text-blue-500" />
                        เลือกนาที:
                      </label>
                      <select
                        id="pickupMinute"
                        value={pickupMinute}
                        onChange={(e) => setPickupMinute(e.target.value)}
                        disabled={!pickupHour}
                        className="w-full px-5 py-4 text-lg border-2 border-blue-300 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        {getAvailableMinutes().map(minute => (
                          <option key={minute} value={minute}>
                            {minute} นาที
                          </option>
                        ))}
                      </select>
                      {!pickupHour && (
                        <p className="text-sm text-gray-500 mt-2">กรุณาเลือกชั่วโมงก่อน</p>
                      )}
                    </div>

                    {/* Preview */}
                    {pickupHour && pickupMinute && (
                      <div className="bg-white p-4 rounded-xl border-2 border-green-300 animate-fade-in">
                        <p className="text-sm text-gray-600 mb-1">เวลารับอาหารที่เลือก:</p>
                        <p className="text-2xl font-bold text-green-600 flex items-center gap-2">
                          ⏰ {pickupHour}:{pickupMinute} น.
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          📅 {new Date().toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'long'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
                        </div>
                        {/* Payment Method Options */}
                        <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-6 border-b-2 border-purple-200">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                                <FiDollarSign className="w-6 h-6 text-white" />
                              </div>
                              <h2 className="text-2xl font-bold text-gray-800">
                                เลือกวิธีชำระเงิน 💳
                              </h2>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* PromptPay Option */}
                              <label className={`relative cursor-pointer group transition-all ${paymentMethod === "PROMPTPAY" ? "scale-105" : ""}`}>
                                <input type="radio" name="paymentMethod" value="PROMPTPAY" checked={paymentMethod === "PROMPTPAY"} onChange={() => setPaymentMethod("PROMPTPAY")} className="peer sr-only" />
                                <div className="p-6 border-2 rounded-2xl transition-all h-full peer-checked:border-purple-500 peer-checked:bg-gradient-to-br peer-checked:from-purple-50 peer-checked:to-indigo-50 hover:border-purple-300 hover:shadow-lg group-hover:scale-105">
                                  <p className="font-bold text-gray-800 text-lg">QR PromptPay</p>
                                  <p className="text-sm text-gray-600 mt-1">ชำระเงินผ่าน QR Code หลังจากร้านค้ายืนยันออร์เดอร์</p>
                                  {paymentMethod === "PROMPTPAY" && (<div className="mt-4 flex items-center gap-2 text-purple-600 font-semibold animate-fade-in"><FiCheckCircle className="w-5 h-5" />เลือกแล้ว</div>)}
                                </div>
                              </label>
                              {/* Cash on Pickup Option */}
                              <label className={`relative cursor-pointer group transition-all ${paymentMethod === "CASH_ON_PICKUP" ? "scale-105" : ""}`}>
                                <input type="radio" name="paymentMethod" value="CASH_ON_PICKUP" checked={paymentMethod === "CASH_ON_PICKUP"} onChange={() => setPaymentMethod("CASH_ON_PICKUP")} className="peer sr-only" />
                                <div className="p-6 border-2 rounded-2xl transition-all h-full peer-checked:border-green-500 peer-checked:bg-gradient-to-br peer-checked:from-green-50 peer-checked:to-emerald-50 hover:border-green-300 hover:shadow-lg group-hover:scale-105">
                                  <p className="font-bold text-gray-800 text-lg">จ่ายเงินสดหน้าร้าน</p>
                                  <p className="text-sm text-gray-600 mt-1">ชำระเงินสดเมื่อมารับอาหารที่ร้าน</p>
                                  {paymentMethod === "CASH_ON_PICKUP" && (<div className="mt-4 flex items-center gap-2 text-green-600 font-semibold animate-fade-in"><FiCheckCircle className="w-5 h-5" />เลือกแล้ว</div>)}
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
            
                        {/* Description / Additional Notes */}
                        <div className="bg-white rounded-3xl shadow-xl border-2 border-orange-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                          <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-6 border-b-2 border-orange-200">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-md">
                                <BiDish className="w-6 h-6 text-white" />
                              </div>
                              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                คำขอเพิ่มเติม (ถ้ามี)
                              </h2>
                            </div>
                          </div>
                          <div className="p-6">
                            <textarea
                              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-y"
                              rows={4}
                              placeholder="เช่น ไม่ใส่ผัก, เผ็ดน้อย, หวานน้อย, หรือข้อความถึงร้านค้า..."
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                          </div>
                        </div>
                      </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl border-2 border-green-200 overflow-hidden sticky top-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <FiShoppingBag className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold">สรุปคำสั่งซื้อ</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between items-center text-gray-700">
                  <span className="font-semibold">ค่าอาหาร</span>
                  <span className="text-lg font-bold">฿{totalPrice.toFixed(0)}</span>
                </div>
                {/* Delivery Fee */}
                <div className="flex justify-between items-center text-gray-700">
                  <span className="font-semibold">ค่าจัดส่ง</span>
                  <span className="text-lg font-bold text-green-600">ฟรี! 🎉</span>
                </div>
                {/* Divider */}
                <div className="border-t-2 border-gray-200 my-4"></div>
                {/* Total */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-2xl border-2 border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-800">ยอดรวมทั้งหมด</span>
                    <span className="text-3xl font-bold text-green-600">฿{totalPrice.toFixed(0)}</span>
                  </div>
                </div>
                {/* Confirm Button */}
                <button
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting || (pickupOption === "scheduled" && (!pickupHour || !pickupMinute))}
                  className="w-full py-5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-lg rounded-2xl transition-all disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-3 group mt-6"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                      กำลังสั่งอาหาร...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="w-6 h-6 group-hover:animate-bounce" />
                      ยืนยันและสั่งอาหาร
                    </>
                  )}
                </button>
                {/* Info Text */}
                <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
                  เมื่อกดยืนยัน คำสั่งซื้อจะถูกส่งไปยังร้านค้าทันที
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slide-down {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
        .animate-slide-down { animation: slide-down 0.4s ease-out; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default CheckoutFeature;
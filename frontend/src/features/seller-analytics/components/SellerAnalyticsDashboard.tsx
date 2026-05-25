import { useEffect, useState } from "react";
import { analyticsService, CategoryAnalyticsItem } from "@/services/analytics.service";
import { useMyStore } from "@/hooks/useStores";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area,
} from "recharts";
import { FiCalendar, FiShoppingBag, FiTrendingUp, FiChevronDown, FiBarChart2, FiActivity, FiX, FiInbox, FiChevronRight } from "react-icons/fi";
import { MdRestaurant } from "react-icons/md";
import { HiOutlineChartBar } from "react-icons/hi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, startOfWeek, endOfWeek } from "date-fns";
import { NO_FOOD_IMAGE, onImgError } from "@/utils/imageUtils";

interface DashboardData {
    stats: {
        totalRevenue: number;
        totalOrders: number;
        averageOrderValue: number;
    };
    salesChart: {
        date: string;
        amount: number;
        orderCount?: number;
    }[];
    topMenus: {
        id: string;
        name: string;
        image: string;
        quantity: number;
        sales: number;
    }[];
}

type ViewMode = "daily" | "weekly" | "monthly" | "yearly";
type ChartType = "line" | "bar" | "area";

export const SellerAnalyticsDashboard = () => {
    const { data: myStore } = useMyStore();
    const [data, setData] = useState<DashboardData | null>(null);
    const [categoryData, setCategoryData] = useState<CategoryAnalyticsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // New State for View Mode
    const [viewMode, setViewMode] = useState<ViewMode>("monthly");
    const [chartType, setChartType] = useState<ChartType>("line");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedCategoryForModal, setSelectedCategoryForModal] = useState<CategoryAnalyticsItem | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!myStore?.id) return;
            setIsLoading(true);
            setError(null);

            // Calculate API parameters based on View Mode
            let startDate: Date;
            let endDate: Date;
            let interval: "day" | "month";

            switch (viewMode) {
                case "daily":
                    startDate = startOfDay(selectedDate);
                    endDate = endOfDay(selectedDate);
                    interval = "day"; // Chart will show 1 point (or we could enhance backend for hourly)
                    break;
                case "weekly":
                    startDate = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start on Monday
                    endDate = endOfWeek(selectedDate, { weekStartsOn: 1 }); // End on Sunday
                    interval = "day"; // Breakdown by day
                    break;
                case "monthly":
                    startDate = startOfMonth(selectedDate);
                    endDate = endOfMonth(selectedDate);
                    interval = "day"; // Breakdown by day
                    break;
                case "yearly":
                    startDate = startOfYear(selectedDate);
                    endDate = endOfYear(selectedDate);
                    interval = "month"; // Breakdown by month
                    break;
                default:
                    startDate = startOfMonth(new Date());
                    endDate = endOfMonth(new Date());
                    interval = "day";
            }

            try {
                const [res, catRes] = await Promise.all([
                    analyticsService.getDashboardData(myStore.id, startDate.toISOString(), endDate.toISOString(), interval),
                    analyticsService.getCategoryAnalytics(myStore.id, startDate.toISOString(), endDate.toISOString()),
                ]);
                if (res && res.success) {
                    setData(res.responseObject);
                } else {
                    setError(res?.message || "No data found");
                }
                if (catRes && catRes.success) {
                    setCategoryData(catRes.responseObject?.categories ?? []);
                }
            } catch (error) {
                console.error("Failed to fetch analytics data", error);
                setError("Failed to load data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [myStore?.id, viewMode, selectedDate]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="text-red-500 text-6xl mb-4">
                    <FiTrendingUp />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
                <p className="text-gray-500 mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-8">
            {/* Header & Filters */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                            <FiTrendingUp className="text-orange-500" />
                            Sales Analytics Dashboard
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Store: <span className="font-semibold text-gray-700">{myStore?.name}</span>
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {/* View Mode Selector */}
                        <div className="relative">
                            <select
                                value={viewMode}
                                onChange={(e) => setViewMode(e.target.value as ViewMode)}
                                className="appearance-none pl-4 pr-10 py-2.5 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-300 transition-all cursor-pointer hover:shadow-md"
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                            <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-500 pointer-events-none" />
                        </div>

                        {/* Smart Date Picker */}
                        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2.5 rounded-xl border-2 border-blue-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all">
                            <FiCalendar className="text-blue-500" />
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date: Date | null) => date && setSelectedDate(date)}
                                dateFormat={
                                    viewMode === "daily" ? "dd MMMM yyyy" :
                                        viewMode === "weekly" ? "dd MMMM yyyy" :
                                            viewMode === "monthly" ? "MMMM yyyy" :
                                                "yyyy"
                                }
                                showMonthYearPicker={viewMode === "monthly"}
                                showYearPicker={viewMode === "yearly"}
                                className="bg-transparent outline-none w-32 text-sm font-semibold text-gray-700 cursor-pointer text-center"
                                maxDate={new Date()}
                            />
                        </div>
                    </div>
                </div>

                {/* Chart Type Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">Chart Type:</span>
                    <div className="flex gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                        <button
                            onClick={() => setChartType("line")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${chartType === "line"
                                ? "bg-white text-orange-600 shadow-md border-2 border-orange-200"
                                : "text-gray-600 hover:bg-white/50"
                                }`}
                            title="Line Chart"
                        >
                            <FiActivity className="w-4 h-4" />
                            Line
                        </button>
                        <button
                            onClick={() => setChartType("bar")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${chartType === "bar"
                                ? "bg-white text-orange-600 shadow-md border-2 border-orange-200"
                                : "text-gray-600 hover:bg-white/50"
                                }`}
                            title="Bar Chart"
                        >
                            <FiBarChart2 className="w-4 h-4" />
                            Bar
                        </button>
                        <button
                            onClick={() => setChartType("area")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${chartType === "area"
                                ? "bg-white text-orange-600 shadow-md border-2 border-orange-200"
                                : "text-gray-600 hover:bg-white/50"
                                }`}
                            title="Area Chart"
                        >
                            <HiOutlineChartBar className="w-4 h-4" />
                            Area
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-6 text-white shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                            <span className="text-3xl font-bold">฿</span>
                        </div>
                        <span className="text-orange-100 text-sm font-medium">Total Revenue</span>
                    </div>
                    <h3 className="text-3xl font-bold mb-1">฿{data.stats.totalRevenue.toLocaleString()}</h3>
                    <p className="text-sm text-orange-100 opacity-80">
                        {viewMode === 'daily' ? 'Today' : viewMode === 'weekly' ? 'This Week' : viewMode === 'monthly' ? 'This Month' : 'This Year'}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-6 text-white shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                            <FiShoppingBag className="w-6 h-6" />
                        </div>
                        <span className="text-blue-100 text-sm font-medium">Total Orders</span>
                    </div>
                    <h3 className="text-3xl font-bold mb-1">{data.stats.totalOrders.toLocaleString()}</h3>
                    <p className="text-sm text-blue-100 opacity-80">orders</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl p-6 text-white shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                            <span className="text-3xl font-bold">฿</span>
                        </div>
                        <span className="text-purple-100 text-sm font-medium">Avg. Order Value</span>
                    </div>
                    <h3 className="text-3xl font-bold mb-1">฿{data.stats.averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                    <p className="text-sm text-purple-100 opacity-80">per order</p>
                </div>
            </div>

            {/* Charts & Top Menus */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <FiTrendingUp className="text-orange-500" />
                            Sales Trend
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <span>Revenue and order count over time</span>
                        </div>
                    </div>
                    <div className="h-[450px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === "line" ? (
                                <LineChart data={data.salesChart} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        tickFormatter={(value) => {
                                            const date = new Date(value);
                                            return viewMode === 'yearly'
                                                ? date.toLocaleDateString('en-GB', { month: 'short' })
                                                : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                                        }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                            padding: '12px',
                                            backgroundColor: 'white'
                                        }}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white p-4 rounded-2xl shadow-xl border-2 border-orange-200">
                                                        <p className="font-bold text-gray-800 mb-3 text-sm border-b pb-2">
                                                            📅 {new Date(label).toLocaleDateString('en-GB', {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span className="text-xs text-gray-600 flex items-center gap-1">
                                                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                                    Revenue:
                                                                </span>
                                                                <span className="font-bold text-orange-600">฿{data.amount.toLocaleString()}</span>
                                                            </div>
                                                            {data.orderCount !== undefined && (
                                                                <div className="flex items-center justify-between gap-4">
                                                                    <span className="text-xs text-gray-600 flex items-center gap-1">
                                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                        Orders:
                                                                    </span>
                                                                    <span className="font-bold text-blue-600">{data.orderCount} orders</span>
                                                                </div>
                                                            )}
                                                            {data.orderCount && data.orderCount > 0 && (
                                                                <div className="flex items-center justify-between gap-4 pt-2 border-t">
                                                                    <span className="text-xs text-gray-600">Avg/order:</span>
                                                                    <span className="font-bold text-green-600">฿{(data.amount / data.orderCount).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="amount"
                                        name="Revenue (THB)"
                                        stroke="#f97316"
                                        strokeWidth={3}
                                        dot={{ r: 5, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 7, strokeWidth: 0, fill: '#ea580c' }}
                                    />
                                </LineChart>
                            ) : chartType === "bar" ? (
                                <BarChart data={data.salesChart} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        tickFormatter={(value) => {
                                            const date = new Date(value);
                                            return viewMode === 'yearly'
                                                ? date.toLocaleDateString('en-GB', { month: 'short' })
                                                : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                                        }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                            padding: '12px',
                                            backgroundColor: 'white'
                                        }}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white p-4 rounded-2xl shadow-xl border-2 border-orange-200">
                                                        <p className="font-bold text-gray-800 mb-3 text-sm border-b pb-2">
                                                            📅 {new Date(label).toLocaleDateString('en-GB', {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span className="text-xs text-gray-600 flex items-center gap-1">
                                                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                                    Revenue:
                                                                </span>
                                                                <span className="font-bold text-orange-600">฿{data.amount.toLocaleString()}</span>
                                                            </div>
                                                            {data.orderCount !== undefined && (
                                                                <div className="flex items-center justify-between gap-4">
                                                                    <span className="text-xs text-gray-600 flex items-center gap-1">
                                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                        Orders:
                                                                    </span>
                                                                    <span className="font-bold text-blue-600">{data.orderCount} orders</span>
                                                                </div>
                                                            )}
                                                            {data.orderCount && data.orderCount > 0 && (
                                                                <div className="flex items-center justify-between gap-4 pt-2 border-t">
                                                                    <span className="text-xs text-gray-600">Avg/order:</span>
                                                                    <span className="font-bold text-green-600">฿{(data.amount / data.orderCount).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar
                                        dataKey="amount"
                                        name="Revenue (THB)"
                                        fill="#f97316"
                                        radius={[8, 8, 0, 0]}
                                        maxBarSize={60}
                                    />
                                </BarChart>
                            ) : (
                                <AreaChart data={data.salesChart} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        tickFormatter={(value) => {
                                            const date = new Date(value);
                                            return viewMode === 'yearly'
                                                ? date.toLocaleDateString('en-GB', { month: 'short' })
                                                : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                                        }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                            padding: '12px',
                                            backgroundColor: 'white'
                                        }}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white p-4 rounded-2xl shadow-xl border-2 border-orange-200">
                                                        <p className="font-bold text-gray-800 mb-3 text-sm border-b pb-2">
                                                            📅 {new Date(label).toLocaleDateString('en-GB', {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span className="text-xs text-gray-600 flex items-center gap-1">
                                                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                                    Revenue:
                                                                </span>
                                                                <span className="font-bold text-orange-600">฿{data.amount.toLocaleString()}</span>
                                                            </div>
                                                            {data.orderCount !== undefined && (
                                                                <div className="flex items-center justify-between gap-4">
                                                                    <span className="text-xs text-gray-600 flex items-center gap-1">
                                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                        Orders:
                                                                    </span>
                                                                    <span className="font-bold text-blue-600">{data.orderCount} orders</span>
                                                                </div>
                                                            )}
                                                            {data.orderCount && data.orderCount > 0 && (
                                                                <div className="flex items-center justify-between gap-4 pt-2 border-t">
                                                                    <span className="text-xs text-gray-600">Avg/order:</span>
                                                                    <span className="font-bold text-green-600">฿{(data.amount / data.orderCount).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        name="Revenue (THB)"
                                        stroke="#f97316"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorAmount)"
                                    />
                                </AreaChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Menus */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <MdRestaurant className="text-orange-500" />
                        Top 5 Best-Selling Items
                    </h3>
                    <div className="space-y-4">
                        {data.topMenus.map((menu, index) => (
                            <div key={menu.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors group">
                                <div className="relative flex-shrink-0">
                                    <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-bold text-sm absolute -top-2 -left-2 shadow-sm z-10 border-2 border-white">
                                        #{index + 1}
                                    </div>
                                    <img
                                        src={menu.image || NO_FOOD_IMAGE}
                                        alt={menu.name}
                                        className="w-16 h-16 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-300"
                                        onError={onImgError(NO_FOOD_IMAGE)}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-800 truncate text-sm mb-1">{menu.name}</h4>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded-md text-orange-700 font-medium">
                                            <FiShoppingBag className="w-3 h-3" /> {menu.quantity}
                                        </span>
                                        <span className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-md text-green-700 font-medium">
                                            <span className="font-bold">฿</span> {menu.sales.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {data.topMenus.length === 0 && (
                            <div className="text-center py-10 text-gray-400">
                                <p>No bestselling items in this period</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Analytics */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FiBarChart2 className="text-orange-500" />
                    Sales by Category
                </h3>
                {categoryData.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <p>No category data in this period</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Bar chart */}
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`} />
                                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 13, fontWeight: 600 }} width={110} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                        formatter={(value: number, _name: string) => [`฿${value.toLocaleString()}`, 'Revenue']}
                                    />
                                    <Bar 
                                        dataKey="sales" 
                                        name="Revenue" 
                                        fill="#f97316" 
                                        radius={[0, 8, 8, 0]} 
                                        maxBarSize={40} 
                                        onClick={(entry) => {
                                            if (entry) {
                                                setSelectedCategoryForModal(entry);
                                            }
                                        }}
                                        className="cursor-pointer"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Rankings table */}
                        <div className="space-y-3">
                            {categoryData.map((cat, i) => (
                                <div 
                                    key={cat.id} 
                                    onClick={() => setSelectedCategoryForModal(cat)}
                                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-orange-50/50 hover:shadow-sm border border-transparent hover:border-orange-100 transition-all cursor-pointer group"
                                >
                                    <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm font-bold flex-shrink-0 ${
                                        i === 0 ? 'bg-orange-500 text-white' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {i + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors truncate">{cat.name}</p>
                                        {cat.topMenu && (
                                            <p className="text-xs text-gray-400 truncate">Top item: {cat.topMenu.name} ({cat.topMenu.quantity} sold)</p>
                                        )}
                                    </div>
                                    <div className="text-right flex-shrink-0 flex items-center gap-2">
                                        <div>
                                            <p className="font-bold text-orange-600">฿{cat.sales.toLocaleString()}</p>
                                            <p className="text-xs text-gray-400">{cat.quantity} items</p>
                                        </div>
                                        <FiChevronRight className="w-5 h-5 text-gray-300 group-hover:text-orange-500 transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Category Details Modal */}
            {selectedCategoryForModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-gray-100 flex flex-col transform transition-all scale-100">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-50 to-yellow-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <span className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                                        <MdRestaurant className="w-5 h-5" />
                                    </span>
                                    {selectedCategoryForModal.name} Sales Breakdown
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    Detailed sales performance for menus in this category
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedCategoryForModal(null)}
                                className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Summary Badges */}
                        <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50/50 border-b border-gray-100">
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                <span className="text-xs text-gray-400 block font-medium">Total Category Revenue</span>
                                <span className="text-2xl font-black text-orange-600 mt-1 block">฿{selectedCategoryForModal.sales.toLocaleString()}</span>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                <span className="text-xs text-gray-400 block font-medium">Total Items Sold</span>
                                <span className="text-2xl font-black text-gray-800 mt-1 block">{selectedCategoryForModal.quantity.toLocaleString()} units</span>
                            </div>
                        </div>

                        {/* Menus List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Menus Performance</h4>
                            {selectedCategoryForModal.menus && selectedCategoryForModal.menus.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedCategoryForModal.menus.map((menu, index) => {
                                        // Calculate percentage of category sales
                                        const salesPercent = selectedCategoryForModal.sales > 0 
                                            ? (menu.sales / selectedCategoryForModal.sales) * 100 
                                            : 0;

                                        return (
                                            <div 
                                                key={menu.id} 
                                                className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-orange-100 hover:bg-orange-50/10 transition-all duration-200"
                                            >
                                                {/* Rank & Image */}
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    <span className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">
                                                        #{index + 1}
                                                    </span>
                                                    <img
                                                        src={menu.image || NO_FOOD_IMAGE}
                                                        alt={menu.name}
                                                        className="w-12 h-12 rounded-xl object-cover shadow-sm"
                                                        onError={onImgError(NO_FOOD_IMAGE)}
                                                    />
                                                </div>

                                                {/* Name & Progress bar */}
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-bold text-gray-800 text-sm truncate mb-1">{menu.name}</h5>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                                                                style={{ width: `${salesPercent}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-[10px] font-semibold text-orange-600 flex-shrink-0 w-8 text-right">
                                                            {salesPercent.toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Stats */}
                                                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-0 pt-2 md:pt-0 border-gray-50">
                                                    <div className="text-left md:text-right">
                                                        <span className="text-[10px] text-gray-400 block uppercase">Sold</span>
                                                        <span className="font-semibold text-gray-700 text-sm">{menu.quantity} units</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] text-gray-400 block uppercase">Revenue</span>
                                                        <span className="font-extrabold text-orange-600 text-sm">฿{menu.sales.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <FiInbox className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No menus sold in this category during the selected period</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setSelectedCategoryForModal(null)}
                                className="px-5 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-semibold hover:bg-gray-900 transition-colors shadow-md hover:shadow-lg"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

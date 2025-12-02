import { SellerAnalyticsDashboard } from "@/features/seller-analytics/components/SellerAnalyticsDashboard";
import NavbarMain from "@/components/layouts/navbars/navbar.main";

const SellerAnalyticsPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <NavbarMain />
            <div className="pt-[90px] px-4 md:px-8 max-w-[1600px] mx-auto">
                <SellerAnalyticsDashboard />
            </div>
        </div>
    );
};

export default SellerAnalyticsPage;

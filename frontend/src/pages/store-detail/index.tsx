// @/pages/store-detail/index.tsx

import StoreDetailFeature from "@/features/store-detail";
import { useParams } from "react-router-dom";

export default function StoreDetailPage() {
    // ดึง storeId มาจาก URL
    const { storeId } = useParams<{ storeId: string }>();

    if (!storeId) {
        return <div>Error: Store ID is missing.</div>;
    }

    return <StoreDetailFeature storeId={storeId} />;
}
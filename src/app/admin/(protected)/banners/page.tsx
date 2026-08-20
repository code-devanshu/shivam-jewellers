import { storeGetAllBanners } from "@/lib/admin-store";
import BannersClient from "./BannersClient";

export const metadata = { title: "Banners" };

export default async function AdminBannersPage() {
  const banners = await storeGetAllBanners();
  return <BannersClient banners={banners} />;
}

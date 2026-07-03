import { CampaignManager } from "@/components/CampaignManager";

export const metadata = { title: "Kampanyalar · PAKYÜREK KPI" };

export default function KampanyalarPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900">Kampanya Yönetimi</h1>
        <p className="mt-1 text-sm text-slate-500">
          Aylık reklam planlarını kategori kategori yönetin. Ay bazında toplam bütçe otomatik
          hesaplanır; tekrar eden planları “önceki aydan kopyala” ile çoğaltabilirsiniz.
        </p>
      </div>
      <CampaignManager />
    </div>
  );
}

import { EntryForm } from "@/components/forms/EntryForm";

export const metadata = { title: "Veri Girişi · PAKYÜREK KPI" };

export default function VeriGirisiPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900">Veri Girişi</h1>
        <p className="mt-1 text-sm text-slate-500">
          Bir dönem seçin ya da yeni oluşturun, sekmeler arasında gezinerek değerleri girin.
          Türkçe biçim desteklenir (ör. <span className="font-medium">12.030,99</span>). Boş bıraktığınız
          alanlar sorun olmaz; bazıları otomatik hesaplanır.
        </p>
      </div>
      <EntryForm />
    </div>
  );
}

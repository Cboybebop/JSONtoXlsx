import { ConverterCard } from "@/components/converter-card";

export default function Home() {
  return (
    <main className="page">
      <section className="hero">
        <p className="badge">Ready for Vercel</p>
        <h1>JSON to XLSX Converter</h1>
        <p className="subtitle">
          Paste JSON or upload a .json file, choose the columns, and download a professional Excel export.
          Everything runs client-side in your browser.
        </p>
      </section>
      <ConverterCard />
    </main>
  );
}

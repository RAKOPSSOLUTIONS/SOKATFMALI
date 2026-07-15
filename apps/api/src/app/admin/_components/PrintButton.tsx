"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-primary py-2">
      <span className="material-symbols-outlined text-[18px]">print</span> Imprimer / PDF
    </button>
  );
}

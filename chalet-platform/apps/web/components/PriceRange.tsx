export function PriceRange({ pricing }: { pricing?: { basePrice: string; weekendPrice?: string; seasonalPrice?: string } }) {
  if (!pricing) return <span className="font-mono text-sm text-ink/40">Price on request</span>;

  const min = Number(pricing.basePrice);
  const max = Number(pricing.seasonalPrice ?? pricing.weekendPrice ?? min * 1.3);

  return (
    <p className="font-mono text-sm text-ink/70">
      {min.toLocaleString()}–{max.toLocaleString()} <span className="text-xs">EGP</span>
      <span className="ml-1.5 font-body text-xs italic text-ink/40">indicative, confirmed before payment</span>
    </p>
  );
}

export function PriceRange({ pricing }: { pricing?: { basePrice: string; weekendPrice?: string; seasonalPrice?: string } }) {
  if (!pricing) return <span className="text-sm text-gray-400">Price on request</span>;

  const min = Number(pricing.basePrice);
  const max = Number(pricing.seasonalPrice ?? pricing.weekendPrice ?? min * 1.3);

  return (
    <p className="text-sm text-gray-500">
      {min.toLocaleString()}–{max.toLocaleString()} EGP
      <span className="ml-1 italic">(indicative — confirmed before payment)</span>
    </p>
  );
}

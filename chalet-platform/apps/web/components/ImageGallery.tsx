'use client';

import { useState } from 'react';
import Image from 'next/image';

export function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return <div className="aspect-[4/3] w-full rounded-xl bg-sand" />;
  }

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-sand">
        <Image src={images[active]} alt={alt} fill className="object-cover" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              type="button"
              key={img + i}
              onClick={() => setActive(i)}
              className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                i === active ? 'border-marina' : 'border-transparent'
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

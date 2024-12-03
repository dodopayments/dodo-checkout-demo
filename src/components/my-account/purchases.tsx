// app/account/components/purchases.tsx
import { memo } from "react";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { Item } from "@/types/account-types";
import Link from "next/link";

interface PurchaseCardProps {
  title: string;
  description: string;
  imageSrc: string;
}

const PurchaseCard = memo(
  ({ title, description, imageSrc }: PurchaseCardProps) => (
    <div className="flex flex-col w-[200px] lg:w-[250px]">
      <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-3">
        <Image
          src={imageSrc}
          alt={title}
          className="object-cover"
          fill
          sizes="(max-width: 250px) 100vw, 250px"
          priority={false}
        />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-[#232321] font-medium">{title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">{description}</span>
          <Link
            href={"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}
            className="p-2 bg-black rounded-lg hover:bg-neutral-900 transition-colors"
            aria-label={`Download ${title}`}
          >
            <DownloadSimple size={20} className="text-white" />
          </Link>
        </div>
      </div>
    </div>
  )
);

PurchaseCard.displayName = "PurchaseCard";

interface OneTimePurchaseProps {
  products: string[];
  items: Item[];
}

export const OneTimePurchase = memo(
  ({ products, items }: OneTimePurchaseProps) => {
    const purchases = items.filter((plan) => products.includes(plan.id));

    if (purchases.length === 0) {
      return null;
    }

    return (
      <section
        aria-labelledby="purchases-heading"
        className="flex my-5 flex-col items-start"
      >
        <h2
          id="purchases-heading"
          className="text-[#232321] font-medium text-[20px] mb-4"
        >
          Purchases
        </h2>
        <div className="flex gap-6 flex-wrap">
          {purchases.map((purchase) => (
            <PurchaseCard
              key={purchase.id}
              title={purchase.title}
              description="Dodo demo book"
              imageSrc={purchase.imageSrc}
            />
          ))}
        </div>
      </section>
    );
  }
);

OneTimePurchase.displayName = "OneTimePurchase";

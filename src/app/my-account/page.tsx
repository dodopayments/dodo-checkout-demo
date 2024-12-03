"use client";
import SignoutButton from "@/components/design-system/SignoutButton";
import { ITEMS_LIST } from "@/constants/Items";
import { CheckCircle, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { Loader } from "lucide-react";

import Image from "next/image";
import { useEffect, useState } from "react";

const SUBSCRIPTION_PLANS = [
  {
    id: "pdt_a7rZcncnbD9sySxO4lj2Y",
    title: "Monthly plan",
    price: 15.0,
    image: {
      src: "/books/stack/Monthly.webp",
      width: "w-[35vw]",
    },
    features: [
      "Get 2 books every month",
      "Early access to new releases",
      "Weekly newsletter",
      "Monthly webinar invite",
    ],
    imagePosition: "right",
  },
  {
    id: "pdt_PKfYkaNVJ7m8QncvaaVip",
    title: "Yearly plan",
    price: 100.0,
    image: {
      src: "/books/stack/Yearly.webp",
      width: "w-[45vw]",
    },
    features: [
      "Get 20 books every Year",
      "Early access to new releases",
      "Weekly newsletter",
      "Monthly webinar invite",
      "Dinner with author",
    ],
    imagePosition: "left",
  },
];

const Feature = ({ text }: { text: string }) => (
  <div className="flex items-center text-left p-2  text-white gap-2">
    <CheckCircle className="text-white mr-2" size={24} weight="fill" />
    <span>{text}</span>
  </div>
);

const SubscriptionCard = ({
  plan,
  data,
}: {
  plan: (typeof SUBSCRIPTION_PLANS)[0];
  data: {
    activated_at: string;
    payment_frequency_interval: string;
    product_id: string;
  };
}) => {
  return (
    <div>
      <div className=" flex items-center my-3 gap-8">
        <Image
          src={plan.image.src}
          alt="Subscription"
          width={350}
          height={280}
        />
        <div className="bg-[#232321] p-3 rounded-xl grid grid-cols-2 items-start  grid-rows-2 ">
          {plan.features.map((feature, index) => (
            <Feature key={index} text={feature} />
          ))}
        </div>
      </div>
      <div className="flex flex-col items-start">
        <span className="text-[#232321] font-semibold text-[18px]">
          {plan.title}
        </span>
        <div className="flex items-center text-neutral-600 gap-2">
          <span>
            Purchased on{" "}
            {new Date(data.activated_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "2-digit",
            })}
          </span>
          <span className="h-3 w-[1px] border-l border-neutral-800" />
          <span>
            Billing frequency is one {data.payment_frequency_interval}
          </span>
        </div>
      </div>
    </div>
  );
};

const Subscriptions = ({
  products,
}: {
  products: {
    activated_at: string;
    payment_frequency_interval: string;
    product_id: string;
  }[];
}) => {
  const purchases = SUBSCRIPTION_PLANS.filter((plan) =>
    products.some((product) => product.product_id === plan.id)
  );
  return (
    <div className="flex my-5 flex-col items-start">
      <span className="text-[#232321] font-medium text-[20px]">
        Active Subscriptions
      </span>
      {!purchases.length ? (
        <div className="bg-[#232321] mt-3 w-full max-w-sm py-6 px-8 rounded-xl text-white">
          No Active Subscriptions
        </div>
      ) : (
        <>
          {purchases.map((purchase, index) => (
            <SubscriptionCard
              key={index}
              plan={purchase}
              data={products[index]}
            />
          ))}
        </>
      )}
    </div>
  );
};

interface PurchaseCardProps {
  title: string;
  description: string;
  imageSrc: string;
}

const PurchaseCard = ({ title, description, imageSrc }: PurchaseCardProps) => {
  return (
    <div className="flex flex-col w-[250px]">
      <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-3">
        <Image src={imageSrc} alt={title} className="object-cover" fill />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-[#232321] font-medium">{title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">{description}</span>
          <button className="p-2 bg-black rounded-lg hover:bg-neutral-900 transition-colors">
            <DownloadSimple size={20} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

const OneTimePurchase = ({ products }: { products: string[] }) => {
  const purchases = ITEMS_LIST.filter((plan) => products.includes(plan.id));

  return (
    <div className="flex my-5 flex-col items-start">
      <span className="text-[#232321] font-medium text-[20px] mb-4">
        Purchases
      </span>
      <div className="flex gap-6 flex-wrap">
        {purchases.map((purchase, index) => (
          <PurchaseCard
            key={index}
            title={purchase.title}
            description="Dodo demo book"
            imageSrc={purchase.imageSrc}
          />
        ))}
      </div>
    </div>
  );
};
const Page = () => {
  const [OneTimeProducts, setOneTimeProducts] = useState([]);
  const [subscriptionProducts, setSubscriptionProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/get-database`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_INTERNAL_KEY}`,
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const { product_ids, subscription_ids } = await response.json();
        setOneTimeProducts(product_ids);
        const test = subscription_ids.map((id: string) => JSON.parse(id));
        setSubscriptionProducts(test);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (<div className="flex w-full min-h-[55vh] h-full justify-center items-center">
      <Loader className="animate-spin" />
    </div>)
  }

  return (
    <div className="w-full h-full p-10 pb-0">
      <div className="bg-white rounded-[20px] flex flex-col p-10">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-4xl">My Account</h1>
          <SignoutButton />
        </div>
        <OneTimePurchase products={OneTimeProducts} />
        <Subscriptions products={subscriptionProducts} />
      </div>
    </div>
  );
};

export default Page;

import { CheckCircle, DownloadSimple } from "@phosphor-icons/react/dist/ssr";

import Image from "next/image";
const SUBSCRIPTION_PLANS = [
  {
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

const Subscriptions = () => {
  return (
    <div className="flex my-5 flex-col items-start">
      <span className="text-[#232321] font-medium text-[20px]">
        Active Subscriptions
      </span>
      <div className=" flex items-center my-3 gap-8">
        <Image
          src="/books/stack/Monthly.webp"
          alt="Subscription"
          width={350}
          height={280}
        />
        <div className="bg-[#232321] p-3 rounded-xl grid grid-cols-2 items-start  grid-rows-2 ">
          {SUBSCRIPTION_PLANS[0].features.map((feature, index) => (
            <Feature key={index} text={feature} />
          ))}
        </div>
      </div>
      <div className="flex flex-col items-start">
        <span className="text-[#232321] font-semibold text-[18px]">
          Monthly Subscriptions
        </span>
        <div className="flex items-center text-neutral-600 gap-2">
          <span>Purchased on 15 Oct 24</span>
          <span className="h-3 w-[1px] border-l border-neutral-800" />
          <span>Next billing on 15 Nov 24</span>
        </div>
      </div>
    </div>
  );
};

interface PurchaseCardProps {
  title: string;
  date: string;
  imageSrc: string;
}

const PurchaseCard = ({ title, date, imageSrc }: PurchaseCardProps) => {
  return (
    <div className="flex flex-col w-[250px]">
      <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-3">
        <Image 
          src={imageSrc} 
          alt={title}
          className="object-cover"
          fill
        />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-[#232321] font-medium">{title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Purchased on {date}</span>
          <button className="p-2 bg-black rounded-lg hover:bg-neutral-900 transition-colors">
          <DownloadSimple size={20} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

const OneTimePurchase = () => {
  const purchases = [
    {
      title: "Lost in Time",
      date: "26 Oct 24",
      imageSrc: "/books/lost-in-time.webp"
    },
    {
      title: "Memoirs of a Wanderer",
      date: "10 Sep 24",
      imageSrc: "/books/memoirs-of-a-wanderer.webp"
    },
    {
      title: "The Himalayan Escape",
      date: "10 Sep 24",
      imageSrc: "/books/himalyan-escape.webp"
    }
  ];

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
            date={purchase.date}
            imageSrc={purchase.imageSrc}
          />
        ))}
      </div>
    </div>
  );
};
const page = () => {
  return (
    <div className="w-full h-full p-10 pb-0">
      <div className="bg-white rounded-[20px] flex flex-col p-10">
        <h1 className="font-display text-4xl">My Account</h1>
        <Subscriptions />
        <OneTimePurchase />
      </div>
    </div>
  );
};

export default page;

import Catalog from "@/components/Home/catalog";
import NewLaunched from "@/components/Home/NewLaunched";
import OverlayCheckout from "@/components/Home/OverlayCheckout";
import Subscriptions from "@/components/Home/Subscriptions";

const Page = async () => {
  return (
    <main className="bg-[#E7E7E3] flex flex-col">
      <div className="flex flex-col w-full min-h-screen px-3 lg:px-12">
        <NewLaunched />
        <Catalog />
      </div>
      <Subscriptions />
      <OverlayCheckout />
    </main>
  );
};

export default Page;
import Catalog from "@/components/Home/catalog";
import NewLaunched from "@/components/Home/NewLaunched";
import Subscriptions from "@/components/Home/Subscriptions";
import React from "react";

const page = async () => {
  return (
    <main className="bg-[#E7E7E3] flex flex-col">
      <div className="flex flex-col w-full min-h-screen px-12">
        <NewLaunched />
        <Catalog />
      </div>
      <Subscriptions />
    </main>
  );
};

export default page;

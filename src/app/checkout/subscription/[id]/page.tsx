"use client";
import CustomerForm from "@/components/checkout/FormPart";
import React from "react";
import { useParams } from "next/navigation";
import ProductPartSub from "@/components/checkout/ProductPartSub";

const Page = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="w-full px-3 lg:px-10 mt-10">
      <div className="flex flex-col lg:flex-row bg-white rounded-xl ">
        <ProductPartSub id={id} />
        <CustomerForm subscription id={id} />
      </div>
    </div>
  );
};

export default Page;

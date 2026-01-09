import { Badge } from "@/components/Badge"
import DemoBottomPopup from "@/components/ui/DemoBottomPopup"
import Link from "next/link"
import Balancer from "react-wrap-balancer"

export default function About() {
  return (
    <>
      <DemoBottomPopup />
      <div className="mt-36 flex flex-col overflow-hidden px-3 pt-20">
      <section
        aria-labelledby="about-overview"
        className="animate-slide-up-fade"
        style={{
          animationDuration: "600ms",
          animationFillMode: "backwards",
        }}
      >
        <Badge>About Dodo Payments</Badge>
        <h1
          id="about-overview"
          className="mt-2 inline-block bg-gradient-to-br from-gray-900 to-gray-800 bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-6xl dark:from-gray-50 dark:to-gray-300"
        >
          <Balancer>
            Payments & Billing for SaaS, AI and Digital Products
          </Balancer>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-gray-700 dark:text-gray-400">
          Dodo Payments is a complete monetisation platform — accept global payments,
          run subscriptions, one‑time purchases, and usage‑based billing without
          stitching tools together. Go live in minutes with developer‑first APIs,
          SDKs and a Merchant of Record built in.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="https://dodopayments.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-md bg-lime-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:ring-offset-2 dark:bg-lime-500 dark:hover:bg-lime-400"
          >
            Visit Dodo Payments
          </Link>
          <Link
            href="https://docs.dodopayments.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900"
          >
            Read the Docs
          </Link>
        </div>
        
        {/* Highlights */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Flexible Billing</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Usage‑based, subscriptions with addons, or one‑time payments built in.</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Global, MoR Included</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Accept payments in 80+ currencies across 150+ countries with Merchant of Record.</p>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}

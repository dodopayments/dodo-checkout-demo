"use client"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../Accordion"

const faqs = [
  {
    question: "How is pricing calculated for image generation?",
    answer:
      "You can pay per image ($0.50–$1), buy a one-time credit pack, or subscribe to Unlimited Pro ($20/mo).",
  },
  {
    question: "Can I use generated images commercially?",
    answer:
      "Yes. All plans include commercial usage rights. See Terms for details.",
  },
  {
    question: "What image resolutions are supported?",
    answer:
      "From 1024×1024 on Pay Per Image up to 4096×4096 on Unlimited Pro.",
  },
  {
    question: "Do you offer an API?",
    answer:
      "Yes. Pro includes API access for server and client integrations, plus webhooks for completions.",
  },
  {
    question: "What styles and models are available?",
    answer:
      "100+ styles spanning photorealistic, digital, classic painting, and more. New styles added regularly.",
  },
]

export function Faqs() {
  return (
    <section className="mt-20 sm:mt-36" aria-labelledby="faq-title">
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-14">
        <div className="col-span-full sm:col-span-5">
          <h2
            id="faq-title"
            className="inline-block scroll-my-24 bg-gradient-to-br from-gray-900 to-gray-800 bg-clip-text py-2 pr-2 text-2xl font-bold tracking-tighter text-transparent lg:text-3xl dark:from-gray-50 dark:to-gray-300"
          >
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-400">
            Can&rsquo;t find the answer you&rsquo;re looking for? Don&rsquo;t
            hesitate to get in touch with our{" "}
            <a
              href="#"
              className="font-medium text-lime-600 hover:text-lime-300 dark:text-lime-400"
            >
              customer support
            </a>{" "}
            team.
          </p>
        </div>
        <div className="col-span-full mt-6 lg:col-span-7 lg:mt-0">
          <Accordion type="multiple" className="mx-auto">
            {faqs.map((item) => (
              <AccordionItem
                value={item.question}
                key={item.question}
                className="py-3 first:pb-3 first:pt-0"
              >
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

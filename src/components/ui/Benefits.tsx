const benefits = [
  {
    title: "Instant Generation",
    description:
      "Generate stunning artwork in seconds, not hours. No waiting around for creativity to strike.",
  },
  {
    title: "Commercial Rights",
    description:
      "Use your generated art for commercial purposes with full rights included in every plan.",
  },
  {
    title: "High Resolution",
    description:
      "Create artwork up to 4K resolution suitable for print, web, and professional use.",
  },
  {
    title: "100+ Art Styles",
    description:
      "From photorealistic to abstract, classical to modern - explore endless artistic possibilities.",
  },
  {
    title: "API Integration",
    description:
      "Seamlessly integrate AI art generation into your applications with our robust API.",
  },
  {
    title: "No Art Skills Required",
    description:
      "Create professional-quality artwork without any drawing or design experience.",
  },
  {
    title: "Unlimited Iterations",
    description: "Refine and perfect your vision with unlimited generation attempts on Pro plans.",
  },
  {
    title: "24/7 Availability",
    description:
      "Create art anytime, anywhere. Our AI models are always ready when inspiration strikes.",
  },
]

export default function Benefits() {
  return (
    <section aria-labelledby="benefits-title" className="mx-auto mt-44">
      <h2
        id="benefits-title"
        className="inline-block bg-gradient-to-t from-gray-900 to-gray-800 bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent md:text-5xl dark:from-gray-50 dark:to-gray-300"
      >
        Why choose Dodo Atlas Studio
      </h2>
      <dl className="mt-8 grid grid-cols-4 gap-x-10 gap-y-8 sm:mt-12 sm:gap-y-10">
        {benefits.map((benefit, index) => (
          <div key={index} className="col-span-4 sm:col-span-2 lg:col-span-1">
            <dt className="font-semibold text-gray-900 dark:text-gray-50">
              {benefit.title}
            </dt>
            <dd className="mt-2 leading-7 text-gray-600 dark:text-gray-400">
              {benefit.description}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

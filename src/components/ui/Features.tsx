import React from "react"
import { Badge } from "../Badge"

const stats = [
  {
    name: "Images generated daily",
    value: "50,000+",
  },
  {
    name: "Art styles available",
    value: "100+",
  },
  {
    name: "Average generation time",
    value: "<10 sec",
  },
]

export default function Features() {
  return (
    <section
      aria-labelledby="features-title"
      className="mx-auto mt-44 w-full max-w-6xl px-3"
    >
      <Badge>Powered by AI</Badge>
      <h2
        id="features-title"
        className="mt-2 inline-block bg-gradient-to-br from-gray-900 to-gray-800 bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-6xl dark:from-gray-50 dark:to-gray-300"
      >
        Lightning-fast AI art generation
      </h2>
      <p className="mt-6 max-w-3xl text-lg leading-7 text-gray-600 dark:text-gray-400">
        Powered by cutting-edge AI models, Dodo AI Studio transforms your creative 
        vision into stunning artwork in seconds. Our advanced infrastructure ensures 
        consistent quality and blazing-fast generation speeds for all your artistic needs.
      </p>
      <dl className="mt-12 grid grid-cols-1 gap-y-8 md:grid-cols-3 md:border-y md:border-gray-200 md:py-14 dark:border-gray-800">
        {stats.map((stat, index) => (
          <React.Fragment key={index}>
            <div className="border-l-2 border-lime-100 pl-6 md:border-l md:text-center lg:border-gray-200 lg:first:border-none dark:border-lime-900 lg:dark:border-gray-800">
              <dd className="inline-block bg-gradient-to-t from-lime-900 to-lime-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent lg:text-6xl dark:from-lime-700 dark:to-lime-400">
                {stat.value}
              </dd>
              <dt className="mt-1 text-gray-600 dark:text-gray-400">
                {stat.name}
              </dt>
            </div>
          </React.Fragment>
        ))}
      </dl>
    </section>
  )
}

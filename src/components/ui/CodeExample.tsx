import Code from "@/components/Code"
import {
  RiLinksLine,
  RiPlugLine,
  RiShieldKeyholeLine,
  RiStackLine,
} from "@remixicon/react"
import { Badge } from "../Badge"
import CodeExampleTabs from "./CodeExampleTabs"

const code = `import { DodoAI } from '@dodo-ai/sdk';

const client = new DodoAI({
  apiKey: process.env.DODO_API_KEY
});

// Generate stunning artwork
const artwork = await client.generate({
  prompt: "A majestic dragon soaring over misty mountains at sunset",
  style: "fantasy_digital_art",
  resolution: "1024x1024",
  model: "dodo-xl-v2"
});

console.log("Generated image:", artwork.url);`

const code2 = `# Generate art via API
curl -X POST "https://api.dodo.ai/v1/generate" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Cyberpunk cityscape with neon lights",
    "style": "cyberpunk",
    "resolution": "2048x2048",
    "quality": "high",
    "batch_size": 1
  }'

# Response:
{
  "id": "img_abc123",
  "status": "completed",
  "images": [{
    "url": "https://cdn.dodo.ai/images/abc123.jpg",
    "resolution": "2048x2048"
  }]
}`

const features = [
  {
    name: "Multi-language SDKs",
    description:
      "Use our SDKs in JavaScript, Python, Ruby, Go, and more languages to integrate seamlessly.",
    icon: RiStackLine,
  },
  {
    name: "Real-time webhooks",
    description:
      "Get instant notifications when your art generation is complete with webhook integrations.",
    icon: RiPlugLine,
  },
  {
    name: "Platform integrations",
    description:
      "Connect to popular platforms like Discord, Slack, Zapier, and creative tools.",
    icon: RiLinksLine,
  },
  {
    name: "Enterprise security",
    description:
      "Your prompts and generated images are encrypted and never used to train our models.",
    icon: RiShieldKeyholeLine,
  },
]

export default function CodeExample() {
  return (
    <section
      aria-labelledby="code-example-title"
      className="mx-auto mt-28 w-full max-w-6xl px-3"
    >
      <Badge>Developer-first</Badge>
      <h2
        id="code-example-title"
        className="mt-2 inline-block bg-gradient-to-br from-gray-900 to-gray-800 bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-6xl dark:from-gray-50 dark:to-gray-300"
      >
        Simple API, <br /> powerful results
      </h2>
      <p className="mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
        Integrate AI art generation into your applications with our intuitive API. 
        From simple prompts to complex artistic visions, create stunning artwork programmatically.
      </p>
      <CodeExampleTabs
        tab1={
          <Code code={code} lang="javascript" copy={false} className="h-[31rem]" />
        }
        tab2={
          <Code
            code={code2}
            lang="bash"
            copy={false}
            className="h-[31rem]"
          />
        }
      />
      <dl className="mt-24 grid grid-cols-4 gap-10">
        {features.map((item) => (
          <div
            key={item.name}
            className="col-span-full sm:col-span-2 lg:col-span-1"
          >
            <div className="w-fit rounded-lg p-2 shadow-md shadow-lime-400/30 ring-1 ring-black/5 dark:shadow-lime-600/30 dark:ring-white/5">
              <item.icon
                aria-hidden="true"
                className="size-6 text-lime-600 dark:text-lime-400"
              />
            </div>
            <dt className="mt-6 font-semibold text-gray-900 dark:text-gray-50">
              {item.name}
            </dt>
            <dd className="mt-2 leading-7 text-gray-600 dark:text-gray-400">
              {item.description}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

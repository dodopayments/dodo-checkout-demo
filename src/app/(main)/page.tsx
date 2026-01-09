import CodeExample from "@/components/ui/CodeExample"
import Cta from "@/components/ui/Cta"
import Features from "@/components/ui/Features"
import { GlobalDatabase } from "@/components/ui/GlobalDatabase"
import Hero from "@/components/ui/Hero"
import LogoCloud from "@/components/ui/LogoCloud"
import DemoBottomPopup from "@/components/ui/DemoBottomPopup"

export default function Home() {
  return (
    <>
      <DemoBottomPopup />
      <main className="flex flex-col overflow-hidden pt-20">
        <Hero />
        <LogoCloud />
        <GlobalDatabase />
        <CodeExample />
        <Features />
        <Cta />
      </main>
    </>
  )
}

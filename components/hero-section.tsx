import { Card, CardContent } from "@/components/ui/card"
import dynamic from 'next/dynamic'

const HeroImage = dynamic(() => import('@/components/HeroImage/HeroImage'), {
  loading: () => <div className="h-[250px] w-full bg-gray-200 animate-pulse rounded-xl" />
})

export default function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-2 md:py-2">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <HeroImage />
        </CardContent>
      </Card>
    </section>
  )
}

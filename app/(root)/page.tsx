import HousingListButton from "@/components/HousingListButton";
import HeroSection from "@/components/hero-section";
import AdminMarquee from "@/components/AdminMarquee";
import PayPropertyTaxButton from "@/components/PayPropertyTaxButton";
import { db } from "@/lib/db";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  MapPin,
  Quote,
  IndianRupee,
  CheckCircle,
  Landmark,
} from "lucide-react";
import LatestNewsUpdate from "@/components/latest-news-update";
import { gpnameinshort } from "@/constants/gpinfor";
import GramPanchayatStats from "@/components/GramPanchayatStats";
import EGovernmentServices from "@/components/e-government-services";
import UsefulLinksSection from "@/components/useful-links-section";
import RecentBlogPosts from "@/components/recent-blog-posts";
type AdminMessage = {
  id: string;
  title: string;
  content: string;
  bgColor: string;
  textColor: string;
  createdAt: Date;
  updatedAt: Date;
};

export default async function Home() {
  const adminMessages = (await db.adminMessage.findMany({})) as AdminMessage[];

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* ================= ANNOUNCEMENT ================= */}
      {adminMessages.length > 0 && (
        <div className="bg-nic-primary text-primary-foreground shadow-sm relative z-10">
          {adminMessages.map((item) => (
            <AdminMarquee
              key={item.id}
              message={item.content}
              bgColor="#F97316"       // nic-primary
              textColor="#FFFFFF"
              speed={18}
              icon={<span className="mr-2">📢</span>}
            />
          ))}
        </div>
      )}

      {/* ================= HERO ================= */}
      <section className="bg-card shadow-sm">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <HeroSection />
        </div>
      </section>

      {/* ================= QUICK SERVICES ================= */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-nic-primary/30 transition-all duration-300 transform hover:-translate-y-1">
              <PayPropertyTaxButton />
            </div>
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-nic-primary/30 transition-all duration-300 transform hover:-translate-y-1">
              <HousingListButton />
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATISTICS ================= */}
      
      <GramPanchayatStats />

      {/* ================= PRODHAN MESSAGE ================= */}
      <section className="py-16 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-card">
            <div className="flex flex-col md:flex-row">
              {/* Image Section */}
              <div className="bg-nic-primary md:w-1/3 p-8 flex flex-col items-center justify-center text-primary-foreground relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Landmark size={120} />
                </div>
                <div className="relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/20 overflow-hidden shadow-xl mb-4">
                  <Image
                    src="https://res.cloudinary.com/dqkmkxgdo/image/upload/v1698161664/IMG_20231024_210228_dyy8dw.jpg"
                    alt="Prodhan"
                    fill
                    sizes="(max-width: 768px) 128px, 160px"
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-center z-10">Smt. Bithika Ghosh</h3>
                <p className="text-primary-foreground/80 text-sm text-center z-10 mt-1">
                  Prodhan, {gpnameinshort} GP
                </p>
              </div>

              {/* Message Section */}
              <div className="md:w-2/3 p-8 md:p-12 relative">
                <Quote className="absolute top-8 left-8 text-border w-16 h-16 -z-10" />
                <h3 className="text-2xl font-bold text-foreground mb-6">
                  Message from the Desk
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg italic z-10 relative">
                  Welcome to {gpnameinshort}. We are committed to
                  transparency accountability and inclusive rural
                  development for the welfare of all citizens. Our goal is to ensure every village thrives through sustainable growth;
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section className="py-16 bg-card border-t border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight mb-3">
              Citizen Services
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Access important panchayat services quickly and easily from your home.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Birth & Death Certificates",
                description: "Apply for or download digital certificates.",
                icon: <Users className="h-6 w-6 text-nic-primary" />,
              },
              {
                title: "Property Tax Services",
                description: "View dues and pay your property taxes online.",
                icon: <MapPin className="h-6 w-6 text-nic-primary" />,
              },
              {
                title: "Welfare Schemes",
                description: "Information on state and central government schemes.",
                icon: <Calendar className="h-6 w-6 text-nic-primary" />,
              },
            ].map((service, index) => (
              <Card
                key={index}
                className="border border-border shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl flex flex-col h-full"
              >
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-4">
                    {service.icon}
                  </div>
                  <CardTitle className="text-xl text-foreground">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <p className="text-muted-foreground mb-6">{service.description}</p>
                  <Button
                    variant="outline"
                    className="w-full border-border text-nic-primary hover:bg-nic-primary hover:text-primary-foreground transition-colors"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================= LATEST NEWS ================= */}
      <section className="py-16 bg-muted border-t border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
              Latest News & Updates
            </h2>
          </div>
          <LatestNewsUpdate />
        </div>
      </section>

      {/* ================= E-GOVERNANCE & USEFUL LINKS ================= */}
      <section className="bg-background border-t border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2">
              <EGovernmentServices />
            </div>
            <div className="my-12 md:mt-12">
              <UsefulLinksSection />
            </div>
          </div>
        </div>
      </section>

      {/* ================= RECENT BLOG POSTS ================= */}
      <section className="bg-muted border-t border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <RecentBlogPosts />
        </div>
      </section>
    </div>
  );
}

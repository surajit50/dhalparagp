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
  Landmark,
  ArrowRight
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
  const gpProfile = await db.gPProfile.findFirst();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-nic-primary/30">
      {/* ================= ANNOUNCEMENT ================= */}
      {adminMessages.length > 0 && (
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md relative z-20">
          {adminMessages.map((item) => (
            <AdminMarquee
              key={item.id}
              message={item.content}
              bgColor="transparent"
              textColor="#FFFFFF"
              speed={18}
              icon={<span className="mr-3 animate-pulse">📢</span>}
            />
          ))}
        </div>
      )}

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-border shadow-sm">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-nic-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
          <HeroSection />
        </div>
      </section>

      {/* ================= QUICK SERVICES (Overlapping Hero) ================= */}
      <section className="relative z-20 -mt-8 md:-mt-12 mb-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="group bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-border/50 hover:shadow-2xl hover:shadow-nic-primary/10 hover:border-nic-primary/40 transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-nic-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <PayPropertyTaxButton />
              </div>
            </div>
            <div className="group bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-border/50 hover:shadow-2xl hover:shadow-nic-primary/10 hover:border-nic-primary/40 transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-bl from-nic-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <HousingListButton />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATISTICS ================= */}
      <div className="py-8 bg-slate-50 dark:bg-slate-950">
        <GramPanchayatStats />
      </div>

      {/* ================= PRODHAN MESSAGE ================= */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <Card className="border border-border/50 shadow-xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900 relative">
            {/* Subtle background accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-nic-primary/5 rounded-bl-full pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center p-8 md:p-12 gap-10">
              
              {/* Image Section */}
              <div className="flex flex-col items-center justify-center shrink-0 relative">
                <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full p-2 bg-gradient-to-br from-nic-primary to-orange-300 shadow-xl mb-6">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-slate-900 relative bg-muted">
                    <Image
                      src="https://res.cloudinary.com/dqkmkxgdo/image/upload/v1698161664/IMG_20231024_210228_dyy8dw.jpg"
                      alt="Prodhan Smt. Bithika Ghosh"
                      fill
                      sizes="(max-width: 768px) 160px, 192px"
                      className="object-cover"
                    />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-center">Smt. Bithika Ghosh</h3>
                <div className="h-1 w-12 bg-nic-primary rounded-full my-3" />
                <p className="text-nic-primary font-semibold text-sm text-center uppercase tracking-wider">
                  Prodhan, {gpnameinshort} GP
                </p>
              </div>

              {/* Message Section */}
              <div className="flex-1 relative">
                <Quote className="text-nic-primary/20 w-16 h-16 mb-4 transform -scale-x-100" />
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
                  Message from the Desk
                </h3>
                <div className="space-y-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {gpProfile?.prodhanMessage ? (
                    gpProfile.prodhanMessage.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))
                  ) : (
                    <>
                      <p>
                        &quot;Welcome to {gpnameinshort}. We are committed to transparency, accountability, and inclusive rural development for the welfare of all citizens.&quot;
                      </p>
                      <p>
                        &quot;Our goal is to ensure every village thrives through sustainable growth, empowering our community for a better tomorrow.&quot;
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950 border-t border-border/50 relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-nic-primary font-semibold tracking-wider uppercase text-sm mb-2 block">Quick Access</span>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Citizen Services
            </h2>
            <div className="h-1.5 w-24 bg-nic-primary mx-auto rounded-full mb-6" />
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              Access important panchayat services quickly and easily from the comfort of your home.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Birth & Death Certificates",
                description: "Apply for new registrations or download your digital certificates instantly.",
                icon: <Users className="h-7 w-7 text-white" />,
                color: "from-blue-500 to-cyan-500",
              },
              {
                title: "Property Tax Services",
                description: "View current dues, payment history and securely pay your property taxes online.",
                icon: <MapPin className="h-7 w-7 text-white" />,
                color: "from-orange-500 to-red-500",
              },
              {
                title: "Welfare Schemes",
                description: "Find information and check eligibility for state and central government schemes.",
                icon: <Calendar className="h-7 w-7 text-white" />,
                color: "from-emerald-500 to-teal-500",
              },
            ].map((service, index) => (
              <Card
                key={index}
                className="group border-0 shadow-lg hover:shadow-xl bg-white dark:bg-slate-900 transition-all duration-500 rounded-3xl overflow-hidden hover:-translate-y-2 flex flex-col h-full"
              >
                <CardHeader className="p-8 pb-4 relative">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${service.color} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    {service.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-nic-primary transition-colors">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 flex-grow flex flex-col justify-between relative">
                  <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed text-lg">{service.description}</p>
                  <Button
                    variant="ghost"
                    className="w-full justify-between border border-border/50 hover:bg-nic-primary hover:text-white transition-all duration-300 rounded-xl h-12 px-6"
                  >
                    <span className="font-semibold">View Details</span>
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================= LATEST NEWS ================= */}
      <section className="py-24 bg-white dark:bg-slate-900 border-t border-border/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <span className="text-nic-primary font-semibold tracking-wider uppercase text-sm mb-2 block">Stay Informed</span>
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Latest News & Updates
              </h2>
            </div>
            <div className="mt-6 md:mt-0">
              <Button variant="outline" className="rounded-full border-nic-primary/30 text-nic-primary hover:bg-nic-primary hover:text-white">
                View All News
              </Button>
            </div>
          </div>
          <LatestNewsUpdate />
        </div>
      </section>

      {/* ================= E-GOVERNANCE & USEFUL LINKS ================= */}
      <section className="bg-slate-50 dark:bg-slate-950 border-t border-border/50 py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-12 items-start">
            <div className="md:col-span-2 bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl shadow-lg border border-border/50">
              <EGovernmentServices />
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl shadow-lg border border-border/50">
              <UsefulLinksSection />
            </div>
          </div>
        </div>
      </section>

      {/* ================= RECENT BLOG POSTS ================= */}
      <section className="bg-white dark:bg-slate-900 border-t border-border/50 py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Community Stories
            </h2>
            <div className="h-1.5 w-24 bg-nic-primary mx-auto rounded-full mb-6" />
          </div>
          <RecentBlogPosts />
        </div>
      </section>
    </div>
  );
}

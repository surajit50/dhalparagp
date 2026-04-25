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
  Landmark 
} from "lucide-react";
import LatestNewsUpdate from "@/components/latest-news-update";
import { gpnameinshort } from "@/constants/gpinfor";

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
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ================= ANNOUNCEMENT ================= */}
      {adminMessages.length > 0 && (
        <div className="bg-[#1e3a8a] text-white shadow-sm relative z-10">
          {adminMessages.map((item) => (
            <AdminMarquee
              key={item.id}
              message={item.content}
              bgColor="#1e3a8a"
              textColor="#ffffff"
              speed={18}
              icon={<span className="mr-2">📢</span>}
            />
          ))}
        </div>
      )}

      {/* ================= HERO ================= */}
      <section className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <HeroSection />
        </div>
      </section>

      {/* ================= QUICK SERVICES ================= */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1">
              <PayPropertyTaxButton />
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1">
              <HousingListButton />
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATISTICS ================= */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#1e3a8a] tracking-tight mb-3">
              Gram Panchayat at a Glance
            </h2>
            <div className="w-24 h-1 bg-[#1e3a8a] mx-auto rounded-full opacity-80"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { value: "15,247", label: "Total Population", icon: <Users size={24} /> },
              { value: "12", label: "Villages Covered", icon: <MapPin size={24} /> },
              { value: "₹2.5Cr", label: "Annual Budget", icon: <IndianRupee size={24} /> },
              { value: "45+", label: "Projects Completed", icon: <CheckCircle size={24} /> },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center hover:bg-blue-50 transition-colors duration-300 group"
              >
                <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#1e3a8a] shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-1">
                  {stat.value}
                </div>
                <div className="text-slate-500 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRODHAN MESSAGE ================= */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-white">
            <div className="flex flex-col md:flex-row">
              {/* Image Section */}
              <div className="bg-[#1e3a8a] md:w-1/3 p-8 flex flex-col items-center justify-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Landmark size={120} />
                </div>
                <div className="relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/20 overflow-hidden shadow-xl mb-4">
                  <Image
                    src="https://res.cloudinary.com/dqkmkxgdo/image/upload/v1698161664/IMG_20231024_210228_dyy8dw.jpg"
                    alt="Prodhan"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-center z-10">Smt. Bithika Ghosh</h3>
                <p className="text-blue-200 text-sm text-center z-10 mt-1">
                  Prodhan, {gpnameinshort} GP
                </p>
              </div>
              
              {/* Message Section */}
              <div className="md:w-2/3 p-8 md:p-12 relative">
                <Quote className="absolute top-8 left-8 text-slate-100 w-16 h-16 -z-10" />
                <h3 className="text-2xl font-bold text-slate-800 mb-6">
                  Message from the Desk
                </h3>
                <p className="text-slate-600 leading-relaxed text-lg italic z-10 relative">
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
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-3">
              Citizen Services
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Access important panchayat services quickly and easily from your home.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Birth & Death Certificates",
                description: "Apply for or download digital certificates.",
                icon: <Users className="h-6 w-6 text-[#1e3a8a]" />,
              },
              {
                title: "Property Tax Services",
                description: "View dues and pay your property taxes online.",
                icon: <MapPin className="h-6 w-6 text-[#1e3a8a]" />,
              },
              {
                title: "Welfare Schemes",
                description: "Information on state and central government schemes.",
                icon: <Calendar className="h-6 w-6 text-[#1e3a8a]" />,
              },
            ].map((service, index) => (
              <Card
                key={index}
                className="border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl flex flex-col h-full"
              >
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                    {service.icon}
                  </div>
                  <CardTitle className="text-xl text-slate-800">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <p className="text-slate-500 mb-6">{service.description}</p>
                  <Button
                    variant="outline"
                    className="w-full border-slate-200 text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white transition-colors"
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
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Latest News & Updates
            </h2>
          </div>
          <LatestNewsUpdate />
        </div>
      </section>
    </div>
  );
}

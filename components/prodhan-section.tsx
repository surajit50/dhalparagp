import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { gpnameinshort } from "@/constants/gpinfor";

export default function ProdhanSection() {
  return (
    <section className="bg-gradient-to-r from-orange-50 to-purple-50 rounded-2xl shadow-lg overflow-hidden transform transition-all hover:shadow-xl hover:-translate-y-1">
      <div className="bg-gradient-to-r from-orange-700 to-purple-700 p-8">
        <h2 className="text-3xl font-bold text-white text-center">
          Message from the Prodhan
        </h2>
      </div>
      <div className="p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-2xl flex-shrink-0">
            <Image
              src="https://res.cloudinary.com/dqkmkxgdo/image/upload/v1698161664/IMG_20231024_210228_dyy8dw.jpg"
              alt="Prodhan's Photo"
              fill
              sizes="192px"
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-gray-800 text-lg leading-relaxed mb-6">
              Welcome to {gpnameinshort} Gram Panchayat. We are committed to
              serving our community and working towards sustainable development.
              Our goal is to improve the quality of life for all residents
              through transparent governance and inclusive growth.
            </p>
            <Link href="/prodhan-speech">
              <Button
                variant="outline"
                className="text-orange-700 border-orange-700 hover:bg-orange-700 hover:text-white transition-colors duration-300 font-semibold"
              >
                Read Full Message
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

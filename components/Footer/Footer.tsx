import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Dhalpara Gram Panchayat Footer",
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-nic-primary text-primary-foreground py-10 border-t border-nic-primary/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:underline">About Us</Link></li>
              <li><Link href="/services" className="hover:underline">Services</Link></li>
              <li><Link href="/development" className="hover:underline">Projects</Link></li>
              <li><Link href="/contact" className="hover:underline">Contact</Link></li>
            </ul>
          </div>

          {/* Govt Links */}
          <div>
            <h4 className="font-semibold mb-4">Government Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://wb.gov.in" className="flex items-center hover:underline">
                  WB Government <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://panchayat.gov.in" className="flex items-center hover:underline">
                  Panchayati Raj <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Schemes */}
          <div>
            <h4 className="font-semibold mb-4">Schemes</h4>
            <ul className="space-y-2">
              <li><Link href="/schemes/pmay" className="hover:underline">PMAY</Link></li>
              <li><Link href="/schemes/mgnrega" className="hover:underline">MGNREGA</Link></li>
            </ul>
          </div>

          {/* Transparency */}
          <div>
            <h4 className="font-semibold mb-4">Transparency</h4>
            <ul className="space-y-2">
              <li><Link href="/rti" className="hover:underline">RTI</Link></li>
              <li><Link href="/budget" className="hover:underline">Budget</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center text-xs border-t border-nic-primary/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {currentYear} Dhalpara Gram Panchayat. All rights reserved.</div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms-and-conditions" className="hover:underline">Terms & Conditions</Link>
            <Link href="/disclaimer" className="hover:underline">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

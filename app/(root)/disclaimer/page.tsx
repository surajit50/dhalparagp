import React from "react";
import { AlertCircle, Mail, Globe, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Disclaimer | Dhalpara Gram Panchayat",
  description: "Official Disclaimer of Dhalpara Gram Panchayat Portal.",
};

export default function Disclaimer() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-orange-100">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-orange-100">
        <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Disclaimer</h1>
          <p className="text-sm text-muted-foreground mt-1">Last Updated: May 25, 2026</p>
        </div>
      </div>

      <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed">
        <p>
          If you require any more information or have any questions about our site's disclaimer, please feel free to contact us by email at{" "}
          <a href="mailto:contact@dhalparagp.in" className="text-orange-600 hover:underline">
            contact@dhalparagp.in
          </a>
          .
        </p>

        <h2 className="text-xl font-bold text-slate-800 mt-8 flex items-center gap-2">
          <Globe className="h-5 w-5 text-orange-500" /> Disclaimers for Dhalpara Gram Panchayat
        </h2>
        <p>
          All the information on this website -{" "}
          <a href="https://www.dhalparagp.in" className="text-orange-600 hover:underline font-semibold">
            https://www.dhalparagp.in
          </a>{" "}
          - is published in good faith and for general information purpose only. Dhalpara Gram Panchayat does not make any warranties about the completeness, reliability and accuracy of this information. Any action you take upon the information you find on this website (Dhalpara Gram Panchayat), is strictly at your own risk. Dhalpara Gram Panchayat will not be liable for any losses and/or damages in connection with the use of our website.
        </p>

        <h2 className="text-xl font-bold text-slate-800 mt-8 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-orange-500" /> External Links Disclaimer
        </h2>
        <p>
          From our website, you can visit other websites by following hyperlinks to such external sites. While we strive to provide only quality links to useful and ethical websites, we have no control over the content and nature of these sites. These links to other websites do not imply a recommendation for all the content found on these sites. Site owners and content may change without notice and may occur before we have the opportunity to remove a link which may have gone 'bad'.
        </p>
        <p>
          Please be also aware that when you leave our website, other sites may have different privacy policies and terms which are beyond our control. Please be sure to check the Privacy Policies of these sites as well as their "Terms of Service" before engaging in any business or uploading any information.
        </p>

        <h2 className="text-xl font-bold text-slate-800 mt-8">Consent</h2>
        <p>
          By using our website, you hereby consent to our disclaimer and agree to its terms.
        </p>

        <h2 className="text-xl font-bold text-slate-800 mt-8">Update</h2>
        <p>
          Should we update, amend or make any changes to this document, those changes will be prominently posted here.
        </p>

        <h2 className="text-xl font-bold text-slate-800 mt-8 flex items-center gap-2">
          <Mail className="h-5 w-5 text-orange-500" /> Contact Info
        </h2>
        <p>
          Official Email:{" "}
          <a href="mailto:contact@dhalparagp.in" className="text-orange-600 hover:underline font-semibold">
            contact@dhalparagp.in
          </a>
        </p>
      </div>
    </div>
  );
}

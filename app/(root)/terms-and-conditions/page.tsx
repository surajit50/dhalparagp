import React from "react";
import { FileText, Mail, Globe, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Terms and Conditions | Dhalpara Gram Panchayat",
  description: "Official Terms and Conditions of Dhalpara Gram Panchayat Portal.",
};

export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-orange-100">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-orange-100">
        <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
          <FileText className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Terms and Conditions</h1>
          <p className="text-sm text-muted-foreground mt-1">Last Updated: May 25, 2026</p>
        </div>
      </div>

      <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed">
        <p>
          Welcome to the official portal of <strong>Dhalpara Gram Panchayat</strong>.
        </p>
        <p>
          These terms and conditions outline the rules and regulations for the use of Dhalpara Gram Panchayat's Website, located at{" "}
          <a href="https://www.dhalparagp.in" className="text-orange-600 hover:underline">
            https://www.dhalparagp.in
          </a>
          .
        </p>
        <p>
          By accessing this website, we assume you accept these terms and conditions. Do not continue to use Dhalpara Gram Panchayat's website if you do not agree to take all of the terms and conditions stated on this page.
        </p>

        <h2 className="text-xl font-bold text-slate-800 mt-8 flex items-center gap-2">
          <Globe className="h-5 w-5 text-orange-500" /> License & Intellectual Property
        </h2>
        <p>
          Unless otherwise stated, Dhalpara Gram Panchayat and/or its licensors own the intellectual property rights for all material on Dhalpara Gram Panchayat. All intellectual property rights are reserved. You may access this from Dhalpara Gram Panchayat for your own personal use subjected to restrictions set in these terms and conditions.
        </p>
        <p>You must not:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Republish material from Dhalpara Gram Panchayat</li>
          <li>Sell, rent or sub-license material from Dhalpara Gram Panchayat</li>
          <li>Reproduce, duplicate or copy material from Dhalpara Gram Panchayat</li>
          <li>Redistribute content from Dhalpara Gram Panchayat</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-800 mt-8 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" /> User Comments & Submissions
        </h2>
        <p>
          Parts of this website offer an opportunity for users to post and exchange opinions and information in certain areas of the website. Dhalpara Gram Panchayat does not filter, edit, publish or review Comments prior to their presence on the website. Comments do not reflect the views and opinions of Dhalpara Gram Panchayat, its agents, and/or affiliates. Comments reflect the views and opinions of the person who posts their views and opinions. To the extent permitted by applicable laws, Dhalpara Gram Panchayat shall not be liable for the Comments or for any liability, damages or expenses caused and/or suffered as a result of any use of and/or posting of and/or appearance of the Comments on this website.
        </p>

        <h2 className="text-xl font-bold text-slate-800 mt-8">Hyperlinking to our Content</h2>
        <p>The following organizations may link to our Website without prior written approval:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Government agencies;</li>
          <li>Search engines;</li>
          <li>News organizations;</li>
          <li>Online directory distributors may link to our Website in the same manner as they hyperlink to the Websites of other listed businesses; and</li>
          <li>System-wide Accredited Businesses except soliciting non-profit organizations, charity shopping malls, and charity fundraising groups which may not hyperlink to our Web site.</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-800 mt-8">Content Liability</h2>
        <p>
          We shall not be held responsible for any content that appears on your Website. You agree to protect and defend us against all claims that are rising on your Website. No link(s) should appear on any Website that may be interpreted as libellous, obscene or criminal, or which infringes, otherwise violates, or advocates the infringement or other violation of, any third party rights.
        </p>

        <h2 className="text-xl font-bold text-slate-800 mt-8">Reservation of Rights</h2>
        <p>
          We reserve the right to request that you remove all links or any particular link to our Website. You approve to immediately remove all links to our Website upon request. We also reserve the right to amend these terms and conditions and its linking policy at any time. By continuously linking to our Website, you agree to be bound to and follow these linking terms and conditions.
        </p>

        <h2 className="text-xl font-bold text-slate-800 mt-8">Removal of links from our website</h2>
        <p>
          If you find any link on our Website that is offensive for any reason, you are free to contact and inform us at any moment. We will consider requests to remove links but we are not obligated to or so or to respond to you directly.
        </p>
        <p>
          We do not ensure that the information on this website is correct, we do not warrant its completeness or accuracy; nor do we promise to ensure that the website remains available or that the material on the website is kept up to date.
        </p>

        <h2 className="text-xl font-bold text-slate-800 mt-8 flex items-center gap-2">
          <Mail className="h-5 w-5 text-orange-500" /> Contact Us
        </h2>
        <p>
          If you have any queries regarding any of our terms, please contact us at{" "}
          <a href="mailto:contact@dhalparagp.in" className="text-orange-600 hover:underline font-semibold">
            contact@dhalparagp.in
          </a>
          .
        </p>
      </div>
    </div>
  );
}

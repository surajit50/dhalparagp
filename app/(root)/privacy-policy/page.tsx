import React from "react";
import { ShieldCheck, Mail, Globe, Lock } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Dhalpara Gram Panchayat",
  description: "Official Privacy Policy of Dhalpara Gram Panchayat Portal.",
};

export default function PrivacyPolicy() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-orange-100">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-orange-100">
        <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mt-1">Last Updated: May 25, 2026</p>
        </div>
      </div>

      <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed">
        <p>
          At <strong>Dhalpara Gram Panchayat</strong>, accessible from{" "}
          <a href="https://www.dhalparagp.in" className="text-orange-600 hover:underline">
            https://www.dhalparagp.in
          </a>
          , one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by our portal and how we use it.
        </p>

        <h2 className="text-xl font-bold text-slate-800 mt-8 flex items-center gap-2">
          <Globe className="h-5 w-5 text-orange-500" /> Log Files
        </h2>
        <p>
          Dhalpara Gram Panchayat follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
        </p>

        <h2 className="text-xl font-bold text-slate-800 mt-8 flex items-center gap-2">
          <Lock className="h-5 w-5 text-orange-500" /> Cookies and Web Beacons
        </h2>
        <p>
          Like any other website, Dhalpara Gram Panchayat uses "cookies". These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
        </p>

        <h2 className="text-xl font-bold text-slate-800 mt-8 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-orange-500" /> Google DoubleClick DART Cookie
        </h2>
        <p>
          Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.dhalparagp.in and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL –{" "}
          <a
            href="https://policies.google.com/technologies/ads"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 hover:underline"
          >
            https://policies.google.com/technologies/ads
          </a>
        </p>

        <h2 className="text-xl font-bold text-slate-800 mt-8">Our Advertising Partners</h2>
        <p>
          Some of advertisers on our site may use cookies and web beacons. Our advertising partners include:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Google AdSense</strong> (Privacy Policy:{" "}
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:underline"
            >
              https://policies.google.com/technologies/ads
            </a>
            )
          </li>
        </ul>

        <h2 className="text-xl font-bold text-slate-800 mt-8">Privacy Policies</h2>
        <p>
          Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on Dhalpara Gram Panchayat, which are sent directly to users' browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
        </p>
        <p>
          Note that Dhalpara Gram Panchayat has no access to or control over these cookies that are used by third-party advertisers.
        </p>

        <h2 className="text-xl font-bold text-slate-800 mt-8">Third Party Privacy Policies</h2>
        <p>
          Dhalpara Gram Panchayat's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
        </p>
        <p>
          You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers' respective websites.
        </p>

        <h2 className="text-xl font-bold text-slate-800 mt-8">Children's Information</h2>
        <p>
          Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
        </p>
        <p>
          Dhalpara Gram Panchayat does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
        </p>

        <h2 className="text-xl font-bold text-slate-800 mt-8 flex items-center gap-2">
          <Mail className="h-5 w-5 text-orange-500" /> Contact Us
        </h2>
        <p>
          If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at{" "}
          <a href="mailto:contact@dhalparagp.in" className="text-orange-600 hover:underline font-semibold">
            contact@dhalparagp.in
          </a>
          .
        </p>
      </div>
    </div>
  );
}

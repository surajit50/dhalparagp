export interface PondLeaseTerm {
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
}

export const POND_LEASE_TERMS: PondLeaseTerm[] = [
  {
    title: "Exclusive Pisciculture Use",
    titleBn: "কেবলমাত্র মৎস্য চাষে ব্যবহার",
    description:
      "The Lessee shall use the pond exclusively for pisciculture (fish farming) and allied fisheries purposes. No unauthorized commercial, residential, or antisocial activities are permitted.",
    descriptionBn:
      "ইজারাকৃত পুকুরটি কেবলমাত্র মৎস্য চাষ, উৎপাদন ও সংরক্ষণের উদ্দেশ্যে ব্যবহার করিতে হইবে। কোনো অবস্থাতেই কোনো অননুমোদিত, বাণিজ্যিক বা অসামাজিক কাজে ব্যবহার করা যাইবে না।"
  },
  {
    title: "Sub-leasing Prohibition",
    titleBn: "উপ-ইজারা বা হস্তান্তর নিষিদ্ধ",
    description:
      "The Lessee shall not sub-lease, assign, transfer, or mortgage the lease rights to any third party without explicit prior written consent from the Gram Panchayat.",
    descriptionBn:
      "পঞ্চায়েত কর্তৃপক্ষের পূর্ব লিখিত অনুমতি ব্যতিরেকে ইজারাদার কোনো অবস্থাতেই এই পুকুর বা ইজারার অধিকার কোনো তৃতীয় পক্ষকে হস্তান্তর, ভাড়া বা উপ-ইজারা দিতে পারিবেন না।"
  },
  {
    title: "Maintenance & Embankment Protection",
    titleBn: "পাড় ও পরিবেশ সংরক্ষণ",
    description:
      "The Lessee is solely responsible for the upkeep, cleanliness, embankment protection, and security of the pond. Use of hazardous or prohibited chemicals is strictly prohibited.",
    descriptionBn:
      "পুকুরের পাড়, বাঁধ, জল এবং চতুর্দিকের পরিবেশ পরিষ্কার ও সুরক্ষিত রাখার সম্পূর্ণ দায়িত্ব ইজারাদারের থাকিবে। জলে ক্ষতিকারক রাসায়নিক বা বিষাক্ত দ্রব্য প্রয়োগ সম্পূর্ণ নিষিদ্ধ।"
  },
  {
    title: "No Structural Alterations",
    titleBn: "ভৌগোলিক বা কাঠামোগত পরিবর্তন নয়",
    description:
      "No permanent structures, excavations, or alterations to the pond's geography/topography are allowed without prior written approval from the Lessor.",
    descriptionBn:
      "গ্রাম পঞ্চায়েতের পূর্বানুমোদন ছাড়া পুকুরের ভৌগোলিক রূপ পরিবর্তন, অননুমোদিত খনন বা কোনো প্রকার স্থায়ী পাকা কাঠামো নির্মাণ করা যাইবে না।"
  },
  {
    title: "Timely Lease Payment",
    titleBn: "নিয়মিত ইজারা মূল্য পরিশোধ",
    description:
      "The agreed lease amount must be paid on schedule as per terms. Any default in payment beyond allowable grace period may lead to immediate cancellation of the lease.",
    descriptionBn:
      "নির্ধারিত ইজারা মূল্য যথাসময়ে নির্দিষ্ট কিস্তিতে গ্রাম পঞ্চায়েত তহবিলে জমা দিতে হইবে। নির্ধারিত সময়সীমা অতিক্রম করিলে ইজারা বাতিল ও আইনানুগ ব্যবস্থা গ্রহণ করা হইবে।"
  },
  {
    title: "Inspection Rights",
    titleBn: "পরিদর্শন ও তদারকির অধিকার",
    description:
      "The Gram Panchayat authorities reserve the right to inspect and supervise the pond premises and activities at any reasonable time without prior notice.",
    descriptionBn:
      "গ্রাম পঞ্চায়েত কর্তৃপক্ষ বা তাদের মনোনীত প্রতিনিধি যে কোনো সময় পুকুর প্রাঙ্গণ পরিদর্শন, তদারকি ও অনুসন্ধান করিবার পূর্ণ অধিকার সংরক্ষণ করেন।"
  },
  {
    title: "Customary Public Rights",
    titleBn: "সাধারণ মানুষের অধিকার অক্ষুণ্ণ রাখা",
    description:
      "The customary domestic or community water requirements of local villagers shall not be unreasonably obstructed by the Lessee.",
    descriptionBn:
      "এলাকার সাধারণ মানুষের চিরাচরিত গৃহস্থালি বা জরুরি প্রয়োজনে জল ব্যবহারে অযৌক্তিক বাধা প্রদান করা যাইবে না।"
  },
  {
    title: "Termination for Breach",
    titleBn: "শর্তভঙ্গে চুক্তি বাতিলকরণ",
    description:
      "The Lessor reserves the right to terminate this agreement immediately if the Lessee violates any terms, defaults in payments, or engages in unlawful activities.",
    descriptionBn:
      "ইজারাদার কোনো শর্ত ভঙ্গ করিলে, বকেয়া পরিশোধে ব্যর্থ হইলে বা আইনবিরোধী কাজে লিপ্ত থাকিলে পঞ্চায়েত কর্তৃপক্ষ এই চুক্তি বাতিল ও পুকুর পুনর্দখল করিতে পারিবে।"
  },
  {
    title: "Handover Condition",
    titleBn: "মেয়াদান্তে হস্তান্তর",
    description:
      "Upon expiry or termination of the lease period, the Lessee shall peacefully handover the pond to the Gram Panchayat in its original good condition.",
    descriptionBn:
      "ইজারার মেয়াদ সমাপ্তির পর ইজারাদার পুকুরটি পূর্বের স্বাভাবিক ও পরিষ্কার অবস্থায় পঞ্চায়েতকে বুঝাইয়া দিতে বাধ্য থাকিবেন।"
  },
  {
    title: "Jurisdiction & Dispute Resolution",
    titleBn: "বিরোধ নিষ্পত্তি ও আইনগত এক্তিয়ার",
    description:
      "Any dispute arising out of this agreement shall be subject to the administrative decision of the Block Development Officer (BDO), Hili Dev. Block and local court jurisdiction.",
    descriptionBn:
      "এই চুক্তি সংক্রান্ত যে কোনো বিরোধের ক্ষেত্রে গ্রাম পঞ্চায়েত এবং সংশ্লিষ্ট ব্লক উন্নয়ন আধিকারিক (BDO)-এর সিদ্ধান্ত চূড়ান্ত বলিয়া গণ্য হইবে।"
  }
];

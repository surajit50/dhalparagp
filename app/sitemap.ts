import { MetadataRoute } from "next";

const BASE_URL = "https://www.dhalparagp.in";

// Next.js generateSitemaps allows splitting a large sitemap into smaller files.
// For demonstration, we split the pages into 5 categories.
export async function generateSitemaps() {
  return [
    { id: 0 }, // Core pages and policies
    { id: 1 }, // About Us pages
    { id: 2 }, // Services pages
    { id: 3 }, // Population and Development pages
    { id: 4 }, // Tenders and Resources pages
  ];
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const lastMod = new Date();

  // Change frequencies and priorities mapped accordingly
  switch (id) {
    case 0:
      return [
        {
          url: `${BASE_URL}/`,
          lastModified: lastMod,
          changeFrequency: "daily",
          priority: 1.0,
        },
        {
          url: `${BASE_URL}/contact`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.8,
        },
        {
          url: `${BASE_URL}/privacy-policy`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.5,
        },
        {
          url: `${BASE_URL}/terms-and-conditions`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.5,
        },
        {
          url: `${BASE_URL}/disclaimer`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.5,
        },
      ];
    case 1:
      return [
        {
          url: `${BASE_URL}/aboutus/history`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.6,
        },
        {
          url: `${BASE_URL}/aboutus/team`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.6,
        },
        {
          url: `${BASE_URL}/aboutus/vision-mission`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.7,
        },
        {
          url: `${BASE_URL}/aboutus/achivement`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.7,
        },
      ];
    case 2:
      return [
        {
          url: `${BASE_URL}/services/e-governance/applications`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.6,
        },
        {
          url: `${BASE_URL}/services/e-governance/verification`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.1,
        },
        {
          url: `${BASE_URL}/services/e-governance/grievance`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.1,
        },
        {
          url: `${BASE_URL}/services/social-welfare/pension`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.1,
        },
        {
          url: `${BASE_URL}/services/social-welfare/education`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.1,
        },
        {
          url: `${BASE_URL}/services/social-welfare/healthcare`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.1,
        },
        {
          url: `${BASE_URL}/services/infrastructure`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.1,
        },
      ];
    case 3:
      return [
        {
          url: `${BASE_URL}/populationinfo/demographics`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.1,
        },
        {
          url: `${BASE_URL}/populationinfo/census`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.1,
        },
        {
          url: `${BASE_URL}/populationinfo/trends`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.1,
        },
        {
          url: `${BASE_URL}/development/agriculture`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.1,
        },
        {
          url: `${BASE_URL}/development/rural-industries`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.1,
        },
        {
          url: `${BASE_URL}/development/skill-development`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.1,
        },
        {
          url: `${BASE_URL}/development/women-empowerment`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.1,
        },
      ];
    case 4:
      return [
        {
          url: `${BASE_URL}/tender/current`,
          lastModified: lastMod,
          changeFrequency: "daily",
          priority: 0.8,
        },
        {
          url: `${BASE_URL}/tender/past`,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.8,
        },
        {
          url: `${BASE_URL}/tender/how-to-apply`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.1,
        },
        {
          url: `${BASE_URL}/tender/guidelines`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.8,
        },
        {
          url: `${BASE_URL}/resources/forms`,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.8,
        },
        {
          url: `${BASE_URL}/resources/acts-rules`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.7,
        },
        {
          url: `${BASE_URL}/resources/reports`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.6,
        },
        {
          url: `${BASE_URL}/resources/faqs`,
          lastModified: lastMod,
          changeFrequency: "monthly",
          priority: 0.8,
        },
      ];
    default:
      return [];
  }
}

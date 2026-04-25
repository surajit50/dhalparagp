import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const holidays = [
  // List-I (Public Holidays in 2026 under the N. I. Act)
  { name: "New Year's Day", date: new Date("2026-01-01"), description: "Public Holiday (N.I. Act)" },
  { name: "Birthday of Swami Vivekananda", date: new Date("2026-01-12"), description: "Public Holiday (N.I. Act)" },
  { name: "Netaji's Birthday", date: new Date("2026-01-23"), description: "Public Holiday (N.I. Act)" },
  { name: "Saraswati Puja [Sree Panchami]", date: new Date("2026-01-23"), description: "Public Holiday (N.I. Act)" },
  { name: "Republic Day", date: new Date("2026-01-26"), description: "Public Holiday (N.I. Act)" },
  { name: "Doljatra", date: new Date("2026-03-03"), description: "Public Holiday (N.I. Act)" },
  { name: "Eid-Ul-Fitr", date: new Date("2026-03-21"), description: "Public Holiday (N.I. Act)" },
  { name: "Ram Navami", date: new Date("2026-03-26"), description: "Public Holiday (N.I. Act)" },
  { name: "Mahavir Jayanti", date: new Date("2026-03-31"), description: "Public Holiday (N.I. Act)" },
  { name: "Good Friday", date: new Date("2026-04-03"), description: "Public Holiday (N.I. Act)" },
  { name: "Birthday of Dr. B. R. Ambedkar", date: new Date("2026-04-14"), description: "Public Holiday (N.I. Act)" },
  { name: "Bengali New Year's Day (Nababarsha)", date: new Date("2026-04-15"), description: "Public Holiday (N.I. Act)" },
  { name: "May Day / Buddha Pumima", date: new Date("2026-05-01"), description: "Public Holiday (N.I. Act)" },
  { name: "Birthday of Rabindranath Tagore", date: new Date("2026-05-09"), description: "Public Holiday (N.I. Act)" },
  { name: "Id-Ud-Zoha (Bakrid)", date: new Date("2026-05-27"), description: "Public Holiday (N.I. Act)" },
  { name: "Muharram", date: new Date("2026-06-26"), description: "Public Holiday (N.I. Act)" },
  { name: "Independence Day", date: new Date("2026-08-15"), description: "Public Holiday (N.I. Act)" },
  { name: "Janmastami", date: new Date("2026-09-04"), description: "Public Holiday (N.I. Act)" },
  { name: "Birthday of Gandhiji", date: new Date("2026-10-02"), description: "Public Holiday (N.I. Act)" },
  { name: "Mahalaya", date: new Date("2026-10-10"), description: "Public Holiday (N.I. Act)" },
  { name: "Durga Puja, Maha Astami", date: new Date("2026-10-19"), description: "Public Holiday (N.I. Act)" },
  { name: "Durga Puja, Maha Nabami", date: new Date("2026-10-20"), description: "Public Holiday (N.I. Act)" },
  { name: "Durga Puja, Dasami", date: new Date("2026-10-21"), description: "Public Holiday (N.I. Act)" },
  { name: "Bhratridwitiya", date: new Date("2026-11-11"), description: "Public Holiday (N.I. Act)" },
  { name: "Birthday of Guru Nanak / Parshwanath's Rathajatra", date: new Date("2026-11-24"), description: "Public Holiday (N.I. Act)" },
  { name: "Christmas Day", date: new Date("2026-12-25"), description: "Public Holiday (N.I. Act)" },

  // List-II (Holidays under the order of State Government in 2026)
  { name: "Day before Saraswati Puja", date: new Date("2026-01-22"), description: "State Government Holiday" },
  { name: "Shab-e-Barat", date: new Date("2026-02-04"), description: "State Government Holiday" },
  { name: "Birthday of Thakur Panchanan Barma", date: new Date("2026-02-14"), description: "State Government Holiday" },
  { name: "Holi (Day after Doljatra)", date: new Date("2026-03-04"), description: "State Government Holiday" },
  { name: "Birth Day of Shri Shri Harichand Thakur", date: new Date("2026-03-17"), description: "State Government Holiday" },
  { name: "Day before Eid-Ul-Fitr", date: new Date("2026-03-20"), description: "State Government Holiday" },
  { name: "Day before Id-Ud-Zoha (Bakrid)", date: new Date("2026-05-26"), description: "State Government Holiday" },
  { name: "Rathayatra", date: new Date("2026-07-16"), description: "State Government Holiday" },
  { name: "Fateha-Dwaz-Daham", date: new Date("2026-08-26"), description: "State Government Holiday" },
  { name: "Rakhi Bandhan", date: new Date("2026-08-28"), description: "State Government Holiday" },
  { name: "Viswakarma Puja", date: new Date("2026-09-17"), description: "State Government Holiday" },
  { name: "Durga Puja, Maha Chaturthi", date: new Date("2026-10-15"), description: "State Government Holiday" },
  { name: "Durga Puja, Maha Panchami", date: new Date("2026-10-16"), description: "State Government Holiday" },
  { name: "Durga Puja, Maha Shashthi", date: new Date("2026-10-17"), description: "State Government Holiday" },
  { name: "Additional Day for Durga Puja", date: new Date("2026-10-22"), description: "State Government Holiday" },
  { name: "Additional Day for Durga Puja", date: new Date("2026-10-23"), description: "State Government Holiday" },
  { name: "Additional Day for Durga Puja", date: new Date("2026-10-24"), description: "State Government Holiday" },
  { name: "Additional Day for Lakshmi Puja", date: new Date("2026-10-26"), description: "State Government Holiday" },
  { name: "Additional Day for Kali Puja", date: new Date("2026-11-09"), description: "State Government Holiday" },
  { name: "Additional Day for Kali Puja", date: new Date("2026-11-10"), description: "State Government Holiday" },
  { name: "Day after Bhratridwitiya", date: new Date("2026-11-12"), description: "State Government Holiday" },
  { name: "Additional Day for Chhat Puja", date: new Date("2026-11-16"), description: "State Government Holiday" },

  // Special/Sunday holidays mentioned
  { name: "Shivaratri", date: new Date("2026-02-15"), description: "Sunday Holiday" },
  { name: "Durga Puja, Maha Saptami", date: new Date("2026-10-18"), description: "Sunday Holiday" },
  { name: "Lakshmi Puja", date: new Date("2026-10-25"), description: "Sunday Holiday" },
  { name: "Kali Puja", date: new Date("2026-11-08"), description: "Sunday Holiday" },
  { name: "Chhat Puja / Birthday of Birsa Munda", date: new Date("2026-11-15"), description: "Sunday Holiday" },
];

async function main() {
  console.log("Starting seeding West Bengal 2026 holidays...");

  for (const holiday of holidays) {
    await prisma.holiday.upsert({
      where: { date: holiday.date },
      update: {
        name: holiday.name,
        description: holiday.description,
      },
      create: {
        name: holiday.name,
        date: holiday.date,
        description: holiday.description,
      },
    });
  }

  console.log("Successfully seeded West Bengal 2026 holidays.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

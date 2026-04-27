import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function POST() {
  try {
    // 🔒 Protect route
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const holidays = [
      // ===== PUBLIC HOLIDAYS =====
      { name: "New Year's Day", date: new Date("2026-01-01"), description: "Public Holiday (N.I. Act)" },
      { name: "Swami Vivekananda Jayanti", date: new Date("2026-01-12"), description: "Public Holiday" },
      { name: "Netaji Subhas Chandra Bose Jayanti", date: new Date("2026-01-23"), description: "Public Holiday" },
      { name: "Saraswati Puja", date: new Date("2026-01-23"), description: "Public Holiday" },
      { name: "Republic Day", date: new Date("2026-01-26"), description: "National Holiday" },

      { name: "Doljatra", date: new Date("2026-03-03"), description: "Public Holiday" },
      { name: "Eid-ul-Fitr", date: new Date("2026-03-21"), description: "Public Holiday (Tentative)" },
      { name: "Ram Navami", date: new Date("2026-03-26"), description: "Public Holiday" },
      { name: "Mahavir Jayanti", date: new Date("2026-03-31"), description: "Public Holiday" },

      { name: "Good Friday", date: new Date("2026-04-03"), description: "Public Holiday" },
      { name: "Ambedkar Jayanti", date: new Date("2026-04-14"), description: "Public Holiday" },
      { name: "Bengali New Year (Poila Boishakh)", date: new Date("2026-04-15"), description: "Public Holiday" },

      { name: "May Day / Buddha Purnima", date: new Date("2026-05-01"), description: "Public Holiday" },
      { name: "Rabindranath Tagore Jayanti", date: new Date("2026-05-09"), description: "Public Holiday" },
      { name: "Bakrid (Eid-ul-Adha)", date: new Date("2026-05-27"), description: "Public Holiday (Tentative)" },

      { name: "Muharram", date: new Date("2026-06-26"), description: "Public Holiday (Tentative)" },

      { name: "Independence Day", date: new Date("2026-08-15"), description: "National Holiday" },

      { name: "Janmashtami", date: new Date("2026-09-04"), description: "Public Holiday" },

      { name: "Gandhi Jayanti", date: new Date("2026-10-02"), description: "National Holiday" },
      { name: "Mahalaya", date: new Date("2026-10-10"), description: "Public Holiday" },

      { name: "Durga Puja - Maha Ashtami", date: new Date("2026-10-19"), description: "Public Holiday" },
      { name: "Durga Puja - Maha Navami", date: new Date("2026-10-20"), description: "Public Holiday" },
      { name: "Durga Puja - Dashami", date: new Date("2026-10-21"), description: "Public Holiday" },

      { name: "Bhai Phonta (Bhratridwitiya)", date: new Date("2026-11-11"), description: "Public Holiday" },
      { name: "Guru Nanak Jayanti", date: new Date("2026-11-24"), description: "Public Holiday" },

      { name: "Christmas Day", date: new Date("2026-12-25"), description: "Public Holiday" },

      // ===== STATE HOLIDAYS =====
      { name: "Day before Saraswati Puja", date: new Date("2026-01-22"), description: "State Holiday" },
      { name: "Shab-e-Barat", date: new Date("2026-02-04"), description: "State Holiday" },
      { name: "Panchanan Barma Jayanti", date: new Date("2026-02-14"), description: "State Holiday" },

      { name: "Holi (Next Day)", date: new Date("2026-03-04"), description: "State Holiday" },
      { name: "Harichand Thakur Jayanti", date: new Date("2026-03-17"), description: "State Holiday" },
      { name: "Day before Eid-ul-Fitr", date: new Date("2026-03-20"), description: "State Holiday" },

      { name: "Day before Bakrid", date: new Date("2026-05-26"), description: "State Holiday" },

      { name: "Rath Yatra", date: new Date("2026-07-16"), description: "State Holiday" },

      { name: "Fateha-Dwaz-Daham", date: new Date("2026-08-26"), description: "State Holiday" },
      { name: "Rakhi Bandhan", date: new Date("2026-08-28"), description: "State Holiday" },

      { name: "Viswakarma Puja", date: new Date("2026-09-17"), description: "State Holiday" },

      { name: "Durga Puja - Chaturthi", date: new Date("2026-10-15"), description: "State Holiday" },
      { name: "Durga Puja - Panchami", date: new Date("2026-10-16"), description: "State Holiday" },
      { name: "Durga Puja - Shashthi", date: new Date("2026-10-17"), description: "State Holiday" },

      { name: "Additional Puja Holiday", date: new Date("2026-10-22"), description: "State Holiday" },
      { name: "Additional Puja Holiday", date: new Date("2026-10-23"), description: "State Holiday" },
      { name: "Additional Puja Holiday", date: new Date("2026-10-24"), description: "State Holiday" },

      { name: "Lakshmi Puja Holiday", date: new Date("2026-10-26"), description: "State Holiday" },

      { name: "Kali Puja Holiday", date: new Date("2026-11-09"), description: "State Holiday" },
      { name: "Kali Puja Holiday", date: new Date("2026-11-10"), description: "State Holiday" },

      { name: "Day after Bhai Phonta", date: new Date("2026-11-12"), description: "State Holiday" },

      { name: "Chhath Puja Holiday", date: new Date("2026-11-16"), description: "State Holiday" },
    ];

    // Group holidays by date to avoid unique constraint issues if the DB has a unique index on date
    const groupedHolidays = holidays.reduce((acc: any[], current) => {
      const dateKey = current.date.toISOString().split('T')[0];
      const existing = acc.find(h => h.date.toISOString().split('T')[0] === dateKey);
      
      if (existing) {
        existing.name = `${existing.name} & ${current.name}`;
        if (current.description && !existing.description?.includes(current.description)) {
          existing.description = existing.description 
            ? `${existing.description}, ${current.description}`
            : current.description;
        }
      } else {
        acc.push({ ...current });
      }
      return acc;
    }, []);

    await db.holiday.deleteMany({});

    await db.holiday.createMany({
      data: groupedHolidays
    });

    return NextResponse.json({
      success: true,
      count: groupedHolidays.length,
      message: "West Bengal holidays seeded successfully (grouped by date)",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}

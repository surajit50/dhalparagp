import { ACHIEVEMENTS } from "@/constants";

export default function Achievements() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Our Achievements</h2>
      <ul className="list-disc list-inside space-y-2">
        {ACHIEVEMENTS.map((achievement, index) => (
          <li key={index} className="text-gray-600">
            {achievement}
          </li>
        ))}
      </ul>
    </div>
  );
}

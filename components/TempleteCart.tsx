import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Stat {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  value: string | number;
  change: string;
}

interface StatCardProps {
  stat: Stat;
}

const TempleteCart: React.FC<StatCardProps> = ({ stat }) => {
  return (
    <Card
      className={cn(
        "relative overflow-hidden hover:shadow-lg transition-all duration-300 group",
        "hover:-translate-y-1 hover:shadow-md dark:hover:shadow-neutral-700"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
          {stat.title}
        </CardTitle>
        <div
          className={cn(
            "p-2 rounded-lg border",
            `bg-${stat.color}/20`,
            `border-${stat.color}/10`,
            `dark:border-${stat.color}/20`
          )}
        >
          <stat.icon
            className={cn(
              "h-5 w-5 transform transition-transform duration-300 group-hover:scale-110",
              `text-${stat.color} dark:text-${stat.color}/80`
            )}
          />
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
          {stat.value}
        </div>
      </CardContent>
    </Card>
  );
};

export default TempleteCart;

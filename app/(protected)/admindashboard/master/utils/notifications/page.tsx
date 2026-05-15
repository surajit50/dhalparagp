import { db } from "@/lib/db";
import React from "react";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Trash2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

async function deleteAllNotifications(formData: FormData): Promise<void> {
  "use server";

  try {
    const result = await db.notification.deleteMany({
      where: {
        read: true,
      },
    });

    if (result.count === 0) {
      throw new Error("No notifications to delete");
    }

    revalidatePath("/admindashboard/master/utils/notification");
  } catch (error) {
    console.error("Failed to delete notifications:", error);
    throw error;
  }
}

const NotificationPage = async () => {
  const notifications = await db.notification.findMany({
    where: {
      read: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

      {/* HEADER */}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-orange-100">
            <Bell className="h-6 w-6 text-orange-700" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              System activity and updates
            </p>
          </div>
        </div>

        <Badge variant="secondary">
          {notifications.length} Notifications
        </Badge>
      </div>

      {/* MAIN CARD */}

      <Card className="border shadow-sm">

        <CardHeader className="flex flex-row items-center justify-between">

          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Center
          </CardTitle>

          <form action={deleteAllNotifications}>
            <Button
              variant="destructive"
              size="sm"
              type="submit"
              disabled={notifications.length === 0}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Notifications
            </Button>
          </form>

        </CardHeader>

        <CardContent>

          {notifications.length === 0 ? (

            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-3">
              <Bell className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">
                No notifications available
              </p>
            </div>

          ) : (

            <ScrollArea className="h-[60vh] pr-4">

              <div className="space-y-4">

                {notifications.map((notification) => (

                  <div
                    key={notification.id}
                    className="flex items-start gap-4 border rounded-lg p-4 hover:bg-muted/50 transition"
                  >

                    <div className="p-2 rounded-md bg-orange-100">
                      <Bell className="h-4 w-4 text-orange-700" />
                    </div>

                    <div className="flex-1">

                      <p className="text-sm font-medium">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3" />
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </ScrollArea>

          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPage;

"use server";

import { db } from "@/lib/db";


// Fetch audit logs with user information
export async function getAuditLogs(limit: number = 50) {
  try {
    const auditLogs = await db.auditLog.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    return { success: true, data: auditLogs };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return { success: false, error: "Failed to fetch audit logs" };
  }
}

// Get system health metrics
export async function getSystemHealth() {
  try {
    // Get database connection status
    const dbStatus = await checkDatabaseHealth();
    
    // Get user statistics
    const userStats = await getUserStatistics();
    
    // Get recent activity
    const recentActivity = await getRecentActivity();
    
    // Get system metrics
    const systemMetrics = await getSystemMetrics();

    return {
      success: true,
      data: {
        database: dbStatus,
        userStats,
        recentActivity,
        systemMetrics
      }
    };
  } catch (error) {
    console.error('Error fetching system health:', error);
    return { success: false, error: "Failed to fetch system health" };
  }
}

// Check database health
async function checkDatabaseHealth() {
  try {
    // Test database connection by performing a simple query
    const startTime = Date.now();
    await db.user.count();
    const responseTime = Date.now() - startTime;
    
    return {
      status: "Online",
      responseTime: `${responseTime}ms`,
      uptime: "99.99%",
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: "Offline",
      responseTime: "N/A",
      uptime: "0%",
      lastChecked: new Date().toISOString(),
      error: "Database connection failed"
    };
  }
}

// Get user statistics
async function getUserStatistics() {
  try {
    const totalUsers = await db.user.count();
    const activeUsers = await db.user.count({
      where: { userStatus: 'active' }
    });
    const adminUsers = await db.user.count({
      where: { role: 'admin' }
    });
    const staffUsers = await db.user.count({
      where: { role: 'staff' }
    });

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      staffUsers,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      adminUsers: 0,
      staffUsers: 0,
      lastUpdated: new Date().toISOString(),
      error: "Failed to fetch user statistics"
    };
  }
}

// Get recent activity
async function getRecentActivity() {
  try {
    const recentLogs = await db.auditLog.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return {
      recentLogs,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return {
      recentLogs: [],
      lastUpdated: new Date().toISOString(),
      error: "Failed to fetch recent activity"
    };
  }
}

// Get system metrics
async function getSystemMetrics() {
  try {
    // Get various system metrics
    const totalWarishApplications = await db.warishApplication.count();
    const pendingWarishApplications = await db.warishApplication.count({
      where: { warishApplicationStatus: 'pending' }
    });
    
    const totalBookings = await db.booking.count();
    const pendingBookings = await db.booking.count({
      where: { status: 'PENDING' }
    });
    
    const totalWorks = await db.worksDetail.count();
    const activeWorks = await db.worksDetail.count({
      where: { workStatus: 'workinprogress' }
    });

    return {
      warishApplications: {
        total: totalWarishApplications,
        pending: pendingWarishApplications
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings
      },
      works: {
        total: totalWorks,
        active: activeWorks
      },
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    return {
      warishApplications: { total: 0, pending: 0 },
      bookings: { total: 0, pending: 0 },
      works: { total: 0, active: 0 },
      lastUpdated: new Date().toISOString(),
      error: "Failed to fetch system metrics"
    };
  }
}

// Create audit log entry
export async function createAuditLog(data: {
  action: string;
  entityId: string;
  entityType: string;
  details?: string;
  userId: string;
}) {
  try {
    const auditLog = await db.auditLog.create({
      data: {
        action: data.action,
        entityId: data.entityId,
        entityType: data.entityType,
        details: data.details,
        userId: data.userId
      }
    });

    return { success: true, data: auditLog };
  } catch (error) {
    console.error('Error creating audit log:', error);
    return { success: false, error: "Failed to create audit log" };
  }
} 
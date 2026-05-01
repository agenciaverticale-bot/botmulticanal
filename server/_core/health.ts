import { Router } from "express";
import { getDb } from "../db";

const router = Router();

/**
 * Health check endpoint
 * Returns 200 if the server is healthy, 503 otherwise
 */
router.get("/health", async (req, res) => {
  try {
    // Check database connection
    const db = await getDb();
    if (!db) {
      return res.status(503).json({
        status: "unhealthy",
        reason: "Database not available",
      });
    }

    // Return healthy status
    return res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    console.error("[Health Check] Error:", error);
    return res.status(503).json({
      status: "unhealthy",
      reason: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;

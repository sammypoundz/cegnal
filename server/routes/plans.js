import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

// GET /api/plans — public plan catalogue (Free / Premium cards)
router.get("/", async (_req, res) => {
  try {
    const plans = await prisma.plan.findMany({ orderBy: { featured: "desc" } });
    res.json({ plans });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to load plans", detail: err.message });
  }
});

// GET /api/plans/:id — a single plan with its features
router.get("/:id", async (req, res) => {
  try {
    const plan = await prisma.plan.findUnique({ where: { id: req.params.id } });
    if (!plan) return res.status(404).json({ error: "Plan not found" });
    res.json({ plan });
  } catch (err) {
    res.status(500).json({ error: "Failed to load plan", detail: err.message });
  }
});

export default router;

import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

/* All FAQ / legal / risk copy is served from the site_content collection. */
router.get("/faqs", async (_req, res) => {
  try {
    const items = await prisma.siteContent.findMany({
      where: { kind: "faq" },
      orderBy: { order: "asc" },
    });
    res.json({ faqs: items.map((c) => ({ q: c.title, a: c.body.join(" ") })) });
  } catch (err) {
    res.status(500).json({ error: "Failed to load FAQs", detail: err.message });
  }
});

router.get("/content/legal", async (_req, res) => {
  try {
    const items = await prisma.siteContent.findMany({
      where: { kind: "legal" },
      orderBy: { order: "asc" },
    });
    const legal = {};
    const slugs = ["terms", "privacy", "risk"];
    items.forEach((c, i) => {
      legal[slugs[i] || c.id.split(":")[1]] = { title: c.title, body: c.body };
    });
    res.json({ legal });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to load legal content", detail: err.message });
  }
});

router.get("/content/risk", async (_req, res) => {
  try {
    const c = await prisma.siteContent.findUnique({
      where: { id: "risk-notice" },
    });
    res.json({ text: c ? c.body.join(" ") : "" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to load risk notice", detail: err.message });
  }
});

export default router;

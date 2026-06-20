import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

interface RegPeriodSetting {
  startDate: string;
  endDate: string;
  isEnabled: boolean;
}

interface AppSettings {
  master_80: RegPeriodSetting;
  master_20: RegPeriodSetting;
  l3: RegPeriodSetting;
}

const DATA_FILE = path.join(process.cwd(), "data.json");

// Helper to load settings & applications from disk
function loadDb() {
  const defaultSettings: AppSettings = {
    master_80: { startDate: "2026-06-05", endDate: "2026-06-20", isEnabled: true },
    master_20: { startDate: "2026-06-12", endDate: "2026-06-25", isEnabled: true },
    l3: { startDate: "2026-06-08", endDate: "2026-06-28", isEnabled: true },
  };

  if (!fs.existsSync(DATA_FILE)) {
    return { settings: defaultSettings, applications: [] };
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const data = JSON.parse(raw);
    return {
      settings: data.settings || defaultSettings,
      applications: data.applications || [],
    };
  } catch (err) {
    console.error("Failed to read database, returning default", err);
    return { settings: defaultSettings, applications: [] };
  }
}

// Helper to save settings & applications to disk
function saveDb(data: { settings: AppSettings; applications: any[] }) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write database to disk", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API 1: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API 2: Get all global settings (including L3, Master80, Master20 registration periods)
  app.get("/api/settings", (req, res) => {
    const db = loadDb();
    res.json(db.settings);
  });

  // API 3: Update global registration settings
  app.post("/api/settings", (req, res) => {
    const db = loadDb();
    db.settings = {
      ...db.settings,
      ...req.body,
    };
    saveDb(db);
    res.json({ success: true, settings: db.settings });
  });

  // API 4: Get student candidacies
  app.get("/api/applications", (req, res) => {
    const db = loadDb();
    res.json(db.applications);
  });

  // API 5: Save/Submit new student candidacy
  app.post("/api/applications", (req, res) => {
    const db = loadDb();
    const newApp = req.body;
    db.applications = [newApp, ...db.applications];
    saveDb(db);
    res.json({ success: true, application: newApp });
  });

  // API 6: Update existing candidacy
  app.put("/api/applications/:id", (req, res) => {
    const db = loadDb();
    const { id } = req.params;
    db.applications = db.applications.map((app: any) =>
      app.id === id ? { ...app, ...req.body } : app
    );
    saveDb(db);
    res.json({ success: true });
  });

  // API 7: Delete application
  app.delete("/api/applications/:id", (req, res) => {
    const db = loadDb();
    const { id } = req.params;
    db.applications = db.applications.filter((app: any) => app.id !== id);
    saveDb(db);
    res.json({ success: true });
  });

  // API 8: Reset all applications
  app.delete("/api/applications", (req, res) => {
    const db = loadDb();
    db.applications = [];
    saveDb(db);
    res.json({ success: true });
  });

  // Vite development middleware vs production static handlers
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

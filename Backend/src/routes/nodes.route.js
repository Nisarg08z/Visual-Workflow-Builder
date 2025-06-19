import express from "express";
import { exec } from "child_process";

const router = express.Router();

router.get("/", (req, res) => {
  exec("python3 main.py --nodes", (error, stdout, stderr) => {
    if (error) {
      console.error("Python error:", stderr);
      return res.status(500).json({ error: "Failed to fetch nodes" });
    }

    try {
      const nodes = JSON.parse(stdout);
      res.json(nodes);
    } catch (err) {
      console.error("JSON parse error:", stdout);
      res.status(500).json({ error: "Invalid JSON from Python" });
    }
  });
});

export default router;

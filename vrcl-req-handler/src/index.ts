import express from "express";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const PROJECT_URL = process.env["SUPABASE_PROJECT_URL"] || "";
const ANON_KEY = process.env["SUPABASE_ANON_KEY"] || "";

const supabase = createClient(PROJECT_URL, ANON_KEY);

const app = express();

app.get("/*", async (req, res) => {
  const host = req.hostname;
  const id = host.split(".")[0];
  const filePath = req.path.slice(1);
  const {data, error } = await supabase.storage.from("vercel").download(`dist/${id}/${filePath}`);

  if (error !== null || data === null) {
    return res.status(500).json({error: error});
  }

  const contentType = filePath.endsWith("html") ? "text/html" : filePath.endsWith("css") ? "text/css" : "application/javascript";
  const content = Buffer.from(await data.arrayBuffer());

  res.set("Content-Type", contentType);
  return res.send(content);
});

app.listen(3001, () => {
  console.log(`App is running up on port 3001!`);
});

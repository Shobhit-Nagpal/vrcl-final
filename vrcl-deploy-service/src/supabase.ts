import { createClient } from "@supabase/supabase-js";
import path from "path";
import fs from "fs";
import "dotenv/config";

const PROJECT_URL = process.env["SUPABASE_PROJECT_URL"] || "";
const ANON_KEY = process.env["SUPABASE_ANON_KEY"] || "";

const supabase = createClient(PROJECT_URL, ANON_KEY);

export async function downloadSupabaseDir(dirPath: string) {
  const { data: files, error } = await supabase.storage
    .from("vercel")
    .list(dirPath);

  if (error) {
    console.error(`Error while listing ${dirPath} from Supabase: `, error);
    return;
  }

  const dirs = files.filter((file) => file.id === null);

  dirs.forEach((dir) => {
    const fullDirPath = path.join("dist", dirPath, dir.name);
    if (!fs.existsSync(fullDirPath)) {
      fs.mkdirSync(fullDirPath, { recursive: true });
    }
  });

  for (const file of files) {
    const filePath = path.join(dirPath, file.name);

    if (file.id === null) {
      await downloadSupabaseDir(filePath);
    } else {
      await downloadFile(filePath);
    }
  }
  console.log("Downloaded all files!");
}

async function downloadFile(filePath: string) {
  const { data, error } = await supabase.storage
    .from("vercel")
    .download(filePath);

  if (error) {
    console.error(`Error while downloading ${filePath} from Supabase: `, error);
    return;
  }

  const buffer = Buffer.from(await data.arrayBuffer());

  const localFilePath = path.join(__dirname, `${filePath}`);
  fs.writeFileSync(localFilePath, buffer);
}

export async function storeDistDir(id: string) {
  let finalDirPath = "";
  const dirPath = path.join(__dirname, `out/${id}/dist`);

  if (!fs.existsSync(dirPath)) {
    finalDirPath = path.join(__dirname, `out/${id}/build`);
  } else {
    finalDirPath = path.join(__dirname, `out/${id}/dist`);
  }

  const allFiles = getAllFiles(finalDirPath);

  allFiles.forEach(async file => {
    await uploadFile(`dist/${id}/` + file.slice(finalDirPath.length + 1), file);
  });
}

function getAllFiles(dir: string) {
  let response: string[] = [];
  const allPaths = fs.readdirSync(dir);
  allPaths.forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      response = response.concat(getAllFiles(fullPath));
    } else {
      response.push(fullPath);
    }
  });
  return response;
}

async function uploadFile(fileName: string, localFilePath: string) {
  const content = fs.readFileSync(localFilePath);
  const { data, error } = await supabase.storage
    .from("vercel")
    .upload(`${fileName}`, content, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error !== null) {
    console.error(error);
  }
  console.log(data);
}

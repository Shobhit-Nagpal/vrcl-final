import { commandOptions, createClient } from "redis";
import { downloadSupabaseDir, storeDistDir } from "./supabase";
import { buildProject } from "./utils";

const client = createClient();
client.on("error", (err) => console.log("Redis Client Error", err));
client.connect();

const publisher = createClient();
publisher.on("error", (err) => console.log("Redis Client Error", err));
publisher.connect();

async function main() {
  console.log("Deploy service setting up...");
  console.log("Service set up!");
  while (1) {
    const response = await client.brPop(
      commandOptions({ isolated: true }),
      "build-queue",
      0,
    );
    console.log(response);
    if (response === null) {
      throw new Error("Response is null");
    }
    const id = response.element;

    await downloadSupabaseDir(`out/${id}`);
    console.log("Downloaded all files successfully");
    await buildProject(id);
    await storeDistDir(id);
    await publisher.hSet("status", id, "deployed");
  }
}

main();

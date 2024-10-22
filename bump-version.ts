import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Path to the manifest.json file
const manifestPath = path.join(__dirname, "manifest.json");

// Read the manifest.json file
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

// Get the new version from the release-it hook
const newVersion = process.env.RELEASE_VERSION;

if (!newVersion) {
  console.error("RELEASE_VERSION environment variable is not set.");
  process.exit(1);
}

// Update the version in the manifest.json file
manifest.version = newVersion;

// Write the updated manifest.json file
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

// Run the yarn build command
execSync("yarn build", { stdio: "inherit" });

console.log(`Version updated to ${newVersion} and build completed.`);

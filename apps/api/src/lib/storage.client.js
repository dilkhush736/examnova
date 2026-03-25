import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config/index.js";
import { createSafeFilename } from "./file.js";

const workspaceRoot = process.cwd();

function resolveSafeStoragePath(storageKey) {
  const absolutePath = path.resolve(workspaceRoot, storageKey);
  if (!absolutePath.startsWith(path.resolve(workspaceRoot))) {
    throw new Error("Invalid storage path.");
  }
  return absolutePath;
}

export function createStorageClient() {
  return {
    async upload(file) {
      const targetDirectory = path.join(workspaceRoot, env.localUploadDir, file.ownerDirectory || "documents");
      await fs.mkdir(targetDirectory, { recursive: true });

      const filename = createSafeFilename(file.originalName);
      const absolutePath = path.join(targetDirectory, filename);
      await fs.writeFile(absolutePath, file.buffer);

      const relativeStorageKey = path.relative(workspaceRoot, absolutePath).replace(/\\/g, "/");

      return {
        storageKey: relativeStorageKey,
        url: "",
        absolutePath,
      };
    },
    async remove(storageKey) {
      const absolutePath = resolveSafeStoragePath(storageKey);
      await fs.rm(absolutePath, { force: true });
    },
    resolve(storageKey) {
      return resolveSafeStoragePath(storageKey);
    },
  };
}

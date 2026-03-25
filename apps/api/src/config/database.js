import mongoose from "mongoose";
import { env } from "./env.js";

let isConnected = false;

function attachDatabaseListeners() {
  if (mongoose.connection.listeners("connected").length > 0) {
    return;
  }

  mongoose.connection.on("connected", () => {
    isConnected = true;
    console.log("MongoDB connected");
  });

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
    console.warn("MongoDB disconnected");
  });

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error", error);
  });
}

export async function connectToDatabase() {
  if (isConnected) {
    return mongoose.connection;
  }

  attachDatabaseListeners();

  await mongoose.connect(env.mongodbUri, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
  });

  return mongoose.connection;
}

export async function disconnectFromDatabase() {
  if (!isConnected) {
    return;
  }

  await mongoose.disconnect();
}

export function getDatabaseStatus() {
  const readyStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return {
    state: readyStates[mongoose.connection.readyState] || "unknown",
    name: mongoose.connection.name || null,
    host: mongoose.connection.host || null,
  };
}

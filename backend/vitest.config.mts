import { existsSync } from "node:fs";
import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";

// Lee backend/.env (expande ${POSTGRES_USER} igual que Compose).
const env = loadEnv("test", process.cwd(), "");

// En el .env, DATABASE_URL apunta al host "db" (la red de Docker).
// Si los tests corren en el host (fuera del contenedor), la base se ve en localhost.
const dentroDeDocker = existsSync("/.dockerenv");
const databaseUrl = dentroDeDocker
  ? env.DATABASE_URL
  : env.DATABASE_URL?.replace("@db:", "@localhost:");

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      JWT_SECRET: "secreto-solo-para-tests", // nunca el real
      // Si no hay .env, una URL de mentira: alcanza para importar app sin que prisma.ts tire.
      // Los tests sin DB nunca llegan a conectarse.
      DATABASE_URL: databaseUrl || "postgresql://test:test@localhost:5432/test",
    },
  },
});

import { spawn } from "node:child_process";
import { join } from "node:path";

const args = process.argv.slice(2);
const port = 5180;
const url = `http://127.0.0.1:${port}`;
const isWindows = process.platform === "win32";

const waitForServer = async () => {
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < 30_000) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  throw lastError ?? new Error(`Timed out waiting for ${url}`);
};

const run = (command, commandArgs, options = {}) =>
  new Promise((resolve) => {
    const child = spawn(command, commandArgs, {
      stdio: "inherit",
      shell: false,
      ...options,
    });

    child.on("exit", (code, signal) => {
      resolve({ code: code ?? (signal ? 1 : 0), signal });
    });
  });

const vite = spawn(
  process.execPath,
  [
    join("node_modules", "vite", "bin", "vite.js"),
    "--host",
    "127.0.0.1",
    "--port",
    String(port),
    "--strictPort",
  ],
  {
    stdio: "inherit",
    shell: false,
  },
);

const stopServer = () => {
  if (!vite.killed) {
    vite.kill();
  }
};

process.on("exit", stopServer);
process.on("SIGINT", () => {
  stopServer();
  process.exit(130);
});
process.on("SIGTERM", () => {
  stopServer();
  process.exit(143);
});

try {
  await waitForServer();
  const playwrightBin = join(
    "node_modules",
    ".bin",
    isWindows ? "playwright.cmd" : "playwright",
  );
  const result = isWindows
    ? await run("cmd.exe", ["/d", "/s", "/c", playwrightBin, "test", ...args])
    : await run(playwrightBin, ["test", ...args]);
  stopServer();
  process.exit(result.code);
} catch (error) {
  stopServer();
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

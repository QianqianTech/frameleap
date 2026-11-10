import { spawn } from "node:child_process";
import { accessSync, constants, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const windows = process.platform === "win32";
const executable = windows ? "frameleap.exe" : "frameleap";
const venvBin = windows ? "Scripts" : "bin";
const userDir = homedir();

function isExecutable(file) {
  if (!file || !path.isAbsolute(file)) return false;
  try {
    accessSync(file, constants.X_OK);
    return statSync(file).isFile();
  } catch {
    return false;
  }
}

function discoveredExecutable() {
  try {
    const record = JSON.parse(readFileSync(path.join(userDir, ".config", "frameleap", "server.json"), "utf8"));
    const command = record?.mcp?.command;
    if (record?.schema !== "frameleap-server/1" || record.mcp?.name !== "frameleap"
      || record.mcp.transport !== "stdio" || typeof command !== "string" || !path.isAbsolute(command)) return;
    if (windows && path.basename(command).toLowerCase() === "frameleap-mcp.exe") {
      return path.join(path.dirname(command), executable);
    }
    const launcher = windows ? "frameleap-mcp.cmd" : "frameleap-mcp";
    if (path.basename(command) === launcher && path.basename(path.dirname(command)) === "bin"
      && path.basename(path.dirname(path.dirname(command))) === "integrations") {
      return path.resolve(path.dirname(command), "..", "..", ".venv", venvBin, executable);
    }
  } catch {
    // A missing or stale discovery record can be recovered from the installed backend.
  }
}

const appData = windows
  ? process.env.APPDATA || path.join(userDir, "AppData", "Roaming")
  : process.platform === "darwin"
    ? path.join(userDir, "Library", "Application Support")
    : process.env.XDG_DATA_HOME || path.join(userDir, ".local", "share");
const installed = path.join(appData, "com.frameleap.studio", "backend", ".venv", venvBin, executable);
const onPath = (process.env.PATH || "").split(path.delimiter)
  .filter((entry) => path.isAbsolute(entry))
  .map((entry) => path.join(entry, executable));
const bin = [process.env.FRAMELEAP_BIN, discoveredExecutable(), installed, ...onPath].find(isExecutable);

if (!bin) {
  process.stderr.write("FrameLeap MCP: open FrameLeap Studio and wait for it to start, or set FRAMELEAP_BIN to its executable.\n");
  process.exitCode = 127;
} else {
  const child = spawn(bin, ["mcp"], { stdio: "inherit", windowsHide: true });
  for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => child.kill(signal));
  child.on("error", (error) => {
    process.stderr.write(`FrameLeap MCP: ${error.message}\n`);
    process.exitCode = 1;
  });
  child.on("exit", (code) => {
    process.exitCode = code ?? 1;
  });
}

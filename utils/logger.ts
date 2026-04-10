import winston from "winston";

const { format, transports } = winston;

const config = {
  levels: {
    error: 0,
    debug: 1,
    warn: 2,
    data: 3,
    info: 4,
    verbose: 5,
  },
  colors: {
    error: "red",
    debug: "blue",
    warn: "yellow",
    data: "grey",
    info: "green",
    verbose: "cyan",
  },
};

winston.addColors(config.colors);

// ─── Shared format builders ───────────────────────────────────────────────────

const buildLabel = (testName: string, browserName?: string) =>
  browserName ? `[${browserName}]` : "";

const fileFormat = (testName: string, browserName?: string) =>
  format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.printf(
      ({ timestamp, level, message, stack }) =>
        `${timestamp} [${level.toUpperCase()}] ${buildLabel(testName, browserName)}: ${stack ?? message}`
    )
  );

const consoleFormat = (testName: string, browserName?: string) =>
  format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.printf(
      ({ timestamp, level, message, stack }) =>
        `${timestamp} [${level.toUpperCase()}] ${buildLabel(testName, browserName)}: ${stack ?? message}`
    ),
    format.colorize({ all: true })
  );

// ─── Logger factory ───────────────────────────────────────────────────────────

/**
 * @param testName   - Playwright testInfo.title
 * @param browserName - Playwright testInfo.project.name (e.g. "chromium", "firefox")
 */
export const createLogger = (testName: string, browserName?: string) => {
  const safeTest = testName.replace(/\s+/g, "_");
  const safeBrowser = browserName?.replace(/\s+/g, "_") ?? "browser";

  return winston.createLogger({
    levels: config.levels,
    transports: [
      // Console — colourised
      new transports.Console({
        format: consoleFormat(testName, browserName),
      }),

      // Per-test-per-browser log — overwrite each run
      new transports.File({
        filename: `logs/${browserName}/${safeTest}_${safeBrowser}.log`,
        format: fileFormat(testName, browserName),
        options: { flags: "w" },
      }),
    ],
  });
};
import { randomBytes } from "node:crypto";
import { isCI } from "ci-info";
import debug from "debug";
import * as KEY from "./config-keys.js";
import { GlobalConfig } from "./config.js";
import { post } from "./post.js";
import { getProjectInfo } from "./project-info.js";
import { getSystemInfo } from "./system-info.js";
const VALID_TELEMETRY_NOTICE_DATE = "2023-08-25";
class AstroTelemetry {
  constructor(opts) {
    this.opts = opts;
  }
  _anonymousSessionId;
  _anonymousProjectInfo;
  config = new GlobalConfig({ name: "astro" });
  debug = debug("astro:telemetry");
  isCI = isCI;
  env = process.env;
  get astroVersion() {
    return this.opts.astroVersion;
  }
  get viteVersion() {
    return this.opts.viteVersion;
  }
  get ASTRO_TELEMETRY_DISABLED() {
    return this.env.ASTRO_TELEMETRY_DISABLED;
  }
  get TELEMETRY_DISABLED() {
    return this.env.TELEMETRY_DISABLED;
  }
  /**
   * Get value from either the global config or the provided fallback.
   * If value is not set, the fallback is saved to the global config,
   * persisted for later sessions.
   */
  getConfigWithFallback(key, getValue) {
    const currentValue = this.config.get(key);
    if (currentValue !== void 0) {
      return currentValue;
    }
    const newValue = getValue();
    this.config.set(key, newValue);
    return newValue;
  }
  get enabled() {
    return this.getConfigWithFallback(KEY.TELEMETRY_ENABLED, () => true);
  }
  get notifyDate() {
    return this.getConfigWithFallback(KEY.TELEMETRY_NOTIFY_DATE, () => "");
  }
  get anonymousId() {
    return this.getConfigWithFallback(KEY.TELEMETRY_ID, () => randomBytes(32).toString("hex"));
  }
  get anonymousSessionId() {
    this._anonymousSessionId = this._anonymousSessionId || randomBytes(32).toString("hex");
    return this._anonymousSessionId;
  }
  get anonymousProjectInfo() {
    this._anonymousProjectInfo = this._anonymousProjectInfo || getProjectInfo(this.isCI);
    return this._anonymousProjectInfo;
  }
  get isDisabled() {
    if (Boolean(this.ASTRO_TELEMETRY_DISABLED || this.TELEMETRY_DISABLED)) {
      return true;
    }
    return this.enabled === false;
  }
  setEnabled(value) {
    this.config.set(KEY.TELEMETRY_ENABLED, value);
  }
  clear() {
    return this.config.clear();
  }
  isValidNotice() {
    if (!this.notifyDate) return false;
    const current = Number(this.notifyDate);
    const valid = new Date(VALID_TELEMETRY_NOTICE_DATE).valueOf();
    return current > valid;
  }
  async notify(callback) {
    if (this.isDisabled || this.isCI) {
      this.debug(`[notify] telemetry has been disabled`);
      return;
    }
    if (this.isValidNotice()) {
      this.debug(`[notify] last notified on ${this.notifyDate}`);
      return;
    }
    const enabled = await callback();
    this.config.set(KEY.TELEMETRY_NOTIFY_DATE, (/* @__PURE__ */ new Date()).valueOf().toString());
    this.config.set(KEY.TELEMETRY_ENABLED, enabled);
    this.debug(`[notify] telemetry has been ${enabled ? "enabled" : "disabled"}`);
  }
  async record(event = []) {
    const events = Array.isArray(event) ? event : [event];
    if (events.length < 1) {
      return Promise.resolve();
    }
    if (this.isDisabled) {
      this.debug("[record] telemetry has been disabled");
      return Promise.resolve();
    }
    const meta = {
      ...getSystemInfo({ astroVersion: this.astroVersion, viteVersion: this.viteVersion })
    };
    const context = {
      ...this.anonymousProjectInfo,
      anonymousId: this.anonymousId,
      anonymousSessionId: this.anonymousSessionId
    };
    if (meta.isCI) {
      context.anonymousId = `CI.${meta.ciName || "UNKNOWN"}`;
    }
    if (this.debug.enabled) {
      this.debug({ context, meta });
      this.debug(JSON.stringify(events, null, 2));
      return Promise.resolve();
    }
    return post({
      context,
      meta,
      events
    }).catch((err) => {
      this.debug(`Error sending event: ${err.message}`);
    });
  }
}
export {
  AstroTelemetry
};

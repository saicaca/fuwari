import {
	AUTO_MODE,
	DARK_MODE,
	DEFAULT_THEME,
	LIGHT_MODE,
} from "@constants/constants.ts";
import { expressiveCodeConfig } from "@/config";
import type { LIGHT_DARK_MODE } from "@/types/config";

export function getDefaultHue(): number {
	const fallback = "250";
	const configCarrier = document.getElementById("config-carrier");
	return Number.parseInt(configCarrier?.dataset.hue || fallback, 10);
}

function getConfigCarrier() {
	return document.getElementById("config-carrier");
}

function getBooleanSettingFromConfig(
	key: keyof DOMStringMap,
	fallback: boolean,
): boolean {
	const configCarrier = getConfigCarrier();
	const value = configCarrier?.dataset[key];
	if (value === "true") return true;
	if (value === "false") return false;
	return fallback;
}

function getNumberSettingFromConfig(
	key: keyof DOMStringMap,
	fallback: number,
): number {
	const configCarrier = getConfigCarrier();
	return Number.parseFloat(configCarrier?.dataset[key] || String(fallback));
}

function applyUiSettingsToRoot(
	glassEnabled: boolean,
	glassBlur: number,
	glassOpacity: number,
	bgEnabled: boolean,
	bgUrl: string,
) {
	const root = document.documentElement;
	root.classList.toggle("ui-glass-enabled", glassEnabled);
	root.classList.toggle("bg-image-enabled", bgEnabled);
	root.style.setProperty("--ui-glass-blur", `${glassBlur}px`);
	root.style.setProperty("--ui-glass-opacity", String(glassOpacity));
	root.style.setProperty("--bg-image-url", `url("${bgUrl}")`);
}

export function getHue(): number {
	const stored = localStorage.getItem("hue");
	return stored ? Number.parseInt(stored, 10) : getDefaultHue();
}

export function setHue(hue: number): void {
	localStorage.setItem("hue", String(hue));
	const r = document.querySelector(":root") as HTMLElement;
	if (!r) {
		return;
	}
	r.style.setProperty("--hue", String(hue));
}

export function applyThemeToDocument(theme: LIGHT_DARK_MODE) {
	switch (theme) {
		case LIGHT_MODE:
			document.documentElement.classList.remove("dark");
			break;
		case DARK_MODE:
			document.documentElement.classList.add("dark");
			break;
		case AUTO_MODE:
			if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
				document.documentElement.classList.add("dark");
			} else {
				document.documentElement.classList.remove("dark");
			}
			break;
	}

	// Set the theme for Expressive Code
	document.documentElement.setAttribute(
		"data-theme",
		expressiveCodeConfig.theme,
	);
}

export function setTheme(theme: LIGHT_DARK_MODE): void {
	localStorage.setItem("theme", theme);
	applyThemeToDocument(theme);
}

export function getStoredTheme(): LIGHT_DARK_MODE {
	return (localStorage.getItem("theme") as LIGHT_DARK_MODE) || DEFAULT_THEME;
}

export function getDefaultGlassEnabled(): boolean {
	return getBooleanSettingFromConfig("uiGlass", true);
}

export function getDefaultGlassBlur(): number {
	return getNumberSettingFromConfig("uiBlur", 18);
}

export function getDefaultGlassOpacity(): number {
	return getNumberSettingFromConfig("uiOpacity", 0.72);
}

export function getDefaultBackgroundEnabled(): boolean {
	return getBooleanSettingFromConfig("bgEnable", false);
}

export function getDefaultBackgroundUrl(): string {
	const configCarrier = getConfigCarrier();
	return configCarrier?.dataset.bgUrl || "";
}

export function getGlassEnabled(): boolean {
	const stored = localStorage.getItem("ui_glass_enabled");
	if (stored === null) return getDefaultGlassEnabled();
	return stored === "true";
}

export function getGlassBlur(): number {
	const stored = localStorage.getItem("ui_glass_blur");
	return stored ? Number.parseFloat(stored) : getDefaultGlassBlur();
}

export function getGlassOpacity(): number {
	const stored = localStorage.getItem("ui_glass_opacity");
	return stored ? Number.parseFloat(stored) : getDefaultGlassOpacity();
}

export function getBackgroundEnabled(): boolean {
	const stored = localStorage.getItem("ui_bg_enabled");
	if (stored === null) return getDefaultBackgroundEnabled();
	return stored === "true";
}

export function setGlassEnabled(enabled: boolean) {
	localStorage.setItem("ui_glass_enabled", String(enabled));
	applyUiSettingsToRoot(
		enabled,
		getGlassBlur(),
		getGlassOpacity(),
		getBackgroundEnabled(),
		getDefaultBackgroundUrl(),
	);
}

export function setGlassBlur(blur: number) {
	localStorage.setItem("ui_glass_blur", String(blur));
	applyUiSettingsToRoot(
		getGlassEnabled(),
		blur,
		getGlassOpacity(),
		getBackgroundEnabled(),
		getDefaultBackgroundUrl(),
	);
}

export function setGlassOpacity(opacity: number) {
	localStorage.setItem("ui_glass_opacity", String(opacity));
	applyUiSettingsToRoot(
		getGlassEnabled(),
		getGlassBlur(),
		opacity,
		getBackgroundEnabled(),
		getDefaultBackgroundUrl(),
	);
}

export function setBackgroundEnabled(enabled: boolean) {
	localStorage.setItem("ui_bg_enabled", String(enabled));
	applyUiSettingsToRoot(
		getGlassEnabled(),
		getGlassBlur(),
		getGlassOpacity(),
		enabled,
		getDefaultBackgroundUrl(),
	);
}

export function loadVisualSettings() {
	applyUiSettingsToRoot(
		getGlassEnabled(),
		getGlassBlur(),
		getGlassOpacity(),
		getBackgroundEnabled(),
		getDefaultBackgroundUrl(),
	);
}

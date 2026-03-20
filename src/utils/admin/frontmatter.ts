function escapeRegExp(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function splitFrontmatter(source: string) {
	const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!match) {
		return {
			hasFrontmatter: false,
			frontmatter: "",
			body: source,
		};
	}

	return {
		hasFrontmatter: true,
		frontmatter: match[1],
		body: source.slice(match[0].length),
	};
}

export function toYamlStringLiteral(value: string) {
	return JSON.stringify(value ?? "");
}

export function toYamlStringArrayLiteral(values: string[]) {
	return `[${values.map((item) => JSON.stringify(item)).join(", ")}]`;
}

export function readFrontmatterField(source: string, fieldName: string) {
	const { frontmatter } = splitFrontmatter(source);
	if (!frontmatter) {
		return "";
	}

	const regex = new RegExp(`^${escapeRegExp(fieldName)}:\\s*(.+)$`, "m");
	const match = frontmatter.match(regex);
	if (!match) {
		return "";
	}

	return match[1].trim().replace(/^['"]|['"]$/g, "");
}

export function readFrontmatterBoolean(
	source: string,
	fieldName: string,
	fallback = false,
) {
	const raw = readFrontmatterField(source, fieldName);
	if (!raw) {
		return fallback;
	}

	return raw.toLowerCase() === "true";
}

export function readFrontmatterStringArray(source: string, fieldName: string) {
	const raw = readFrontmatterField(source, fieldName);
	if (!raw) {
		return [];
	}

	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed)
			? parsed.map((item) => String(item).trim()).filter(Boolean)
			: [];
	} catch {
		return raw
			.split(/[,\n]/)
			.map((item) => item.trim())
			.filter(Boolean);
	}
}

export function upsertFrontmatterFields(
	source: string,
	fields: Record<string, string>,
) {
	const { hasFrontmatter, frontmatter, body } = splitFrontmatter(source);
	const lines = hasFrontmatter
		? frontmatter.split(/\r?\n/).filter((line) => line.trim() !== "")
		: [];

	for (const [fieldName, rawValue] of Object.entries(fields)) {
		const nextLine = `${fieldName}: ${rawValue}`;
		const index = lines.findIndex((line) =>
			new RegExp(`^${escapeRegExp(fieldName)}:`).test(line),
		);

		if (index >= 0) {
			lines[index] = nextLine;
			continue;
		}

		lines.push(nextLine);
	}

	const normalizedBody = body.replace(/^\r?\n/, "");
	return ["---", ...lines, "---", normalizedBody].join("\n");
}

export function normalizeCategoryList(category: unknown): string[] {
	if (Array.isArray(category)) {
		return category
			.map((value) => (typeof value === "string" ? value.trim() : ""))
			.filter((value) => value !== "");
	}
	if (typeof category === "string") {
		const trimmed = category.trim();
		return trimmed ? [trimmed] : [];
	}
	return [];
}

export function getPrimaryCategory(category: unknown): string | null {
	const categories = normalizeCategoryList(category);
	return categories.length > 0 ? categories[0] : null;
}

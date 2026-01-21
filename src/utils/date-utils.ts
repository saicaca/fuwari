export function formatDateToYYYYMMDD(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function isDateInFuture(date: Date | string, now = Date.now()): boolean {
	const value = date instanceof Date ? date.getTime() : new Date(date).getTime();
	if (Number.isNaN(value)) return false;
	return value > now;
}

export function getUpdatedDate(published: Date, updated?: Date): Date | undefined {
	if (!updated) return undefined;
	return updated.getTime() > published.getTime() ? updated : undefined;
}

export function getUpdatedDateString(
	published: Date,
	updated?: Date,
): string | undefined {
	const date = getUpdatedDate(published, updated);
	return date ? formatDateToYYYYMMDD(date) : undefined;
}

export function getEffectiveDate(published: Date, updated?: Date): Date {
	return getUpdatedDate(published, updated) || published;
}

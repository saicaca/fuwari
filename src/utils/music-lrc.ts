export type MusicLyricLine = {
	time: number;
	text: string;
};

const TIMESTAMP_PATTERN = /\[(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?\]/g;
const OFFSET_PATTERN = /^\[offset:([+-]?\d+)\]$/i;

function parseTimestamp(
	minuteText: string,
	secondText: string,
	fractionText?: string,
): number {
	const minutes = Number(minuteText);
	const seconds = Number(secondText);
	const fraction = fractionText
		? Number(`0.${fractionText.padEnd(3, "0").slice(0, 3)}`)
		: 0;

	return minutes * 60 + seconds + fraction;
}

export function parseLrc(content: string): MusicLyricLine[] {
	const lines = content.split(/\r?\n/);
	const lyricLines: MusicLyricLine[] = [];
	let offsetSeconds = 0;

	for (const rawLine of lines) {
		const line = rawLine.trim();
		if (!line) continue;

		const offsetMatch = line.match(OFFSET_PATTERN);
		if (offsetMatch) {
			offsetSeconds = Number(offsetMatch[1]) / 1000;
			continue;
		}

		const timestamps = [...line.matchAll(TIMESTAMP_PATTERN)];
		if (timestamps.length === 0) continue;

		const text = line.replace(TIMESTAMP_PATTERN, "").trim();
		for (const timestamp of timestamps) {
			const time = Math.max(
				0,
				parseTimestamp(timestamp[1], timestamp[2], timestamp[3]) + offsetSeconds,
			);
			lyricLines.push({
				time,
				text,
			});
		}
	}

	return lyricLines.sort((left, right) => left.time - right.time);
}

export async function loadLrcLines(url: string): Promise<MusicLyricLine[]> {
	const response = await fetch(url, {
		referrerPolicy: "no-referrer",
	});
	if (!response.ok) {
		throw new Error(`HTTP ${response.status} ${response.statusText}`);
	}

	const content = await response.text();
	return parseLrc(content);
}

<script lang="ts">
	import { language, translate } from "@/i18n/client";
	import Key from "@/i18n/i18nKey";
	import { loadLrcLines, type MusicLyricLine } from "@/utils/music-lrc";
	import type { MusicTrack } from "@/utils/music";
	import { tick } from "svelte";

	type PlayMode = "order" | "loop" | "random";

	export let tracks: MusicTrack[] = [];
	export let enabled = true;
	export let errorMessage = "";
	export let initialVolume = 0.72;

	let audioElement: HTMLAudioElement | null = null;
	let search = "";
	let currentTrackIndex = 0;
	let isPlaying = false;
	let playMode: PlayMode = "order";
	let currentTime = 0;
	let duration = 0;
	let speed = 1;
	let speedValue = "1";
	let volume = Math.max(0, Math.min(initialVolume, 1));
	let lyricContainer: HTMLElement | null = null;
	let lyricLines: MusicLyricLine[] = [];
	let lyricsLoading = false;
	let lyricTrackId = "";
	let lastScrolledLyricIndex = -2;

	$: query = search.trim().toLowerCase();
	$: filteredTracks = tracks.filter((track) => {
		if (!query) return true;
		const candidate = [
			track.title,
			track.artist || "",
			track.album || "",
			track.uploader || "",
		]
			.join(" ")
			.toLowerCase();
		return candidate.includes(query);
	});
	$: currentTrack = tracks[currentTrackIndex] ?? null;
	$: speed = Number(speedValue);
	$: if (audioElement) {
		audioElement.volume = volume;
		audioElement.playbackRate = speed;
	}

	function clampIndex(index: number): number {
		if (tracks.length === 0) return 0;
		if (index < 0) return tracks.length - 1;
		if (index >= tracks.length) return 0;
		return index;
	}

	function formatTime(totalSeconds: number): string {
		if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
			return "00:00";
		}
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = Math.floor(totalSeconds % 60);
		return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
	}

	function getTrackIndex(trackId: string): number {
		return tracks.findIndex((track) => track.id === trackId);
	}

	function getActiveLyricIndex(
		playbackTime: number,
		lines: MusicLyricLine[],
	): number {
		for (let index = lines.length - 1; index >= 0; index -= 1) {
			if (playbackTime >= lines[index].time) {
				return index;
			}
		}
		return -1;
	}

	function playCurrentTrack(): void {
		if (!audioElement || !currentTrack) return;
		audioElement.src = currentTrack.sourceUrl;
		const playTask = audioElement.play();
		if (playTask && typeof playTask.then === "function") {
			playTask
				.then(() => {
					isPlaying = true;
				})
				.catch(() => {
					isPlaying = false;
				});
			return;
		}
		isPlaying = true;
	}

	function changeTrack(index: number, autoplay = true): void {
		if (tracks.length === 0) return;
		currentTrackIndex = clampIndex(index);
		currentTime = 0;
		duration = 0;

		if (!audioElement) return;
		audioElement.src = tracks[currentTrackIndex]?.sourceUrl || "";
		audioElement.load();
		if (autoplay) {
			playCurrentTrack();
		} else {
			isPlaying = false;
		}
	}

	function togglePlay(): void {
		if (!audioElement || !currentTrack) return;
		if (isPlaying) {
			audioElement.pause();
			isPlaying = false;
			return;
		}
		playCurrentTrack();
	}

	function pickRandomIndex(): number {
		if (tracks.length <= 1) return currentTrackIndex;
		let nextIndex = currentTrackIndex;
		while (nextIndex === currentTrackIndex) {
			nextIndex = Math.floor(Math.random() * tracks.length);
		}
		return nextIndex;
	}

	function playNext(): void {
		if (tracks.length === 0) return;
		const nextIndex =
			playMode === "random" ? pickRandomIndex() : currentTrackIndex + 1;
		changeTrack(nextIndex);
	}

	function playPrevious(): void {
		if (tracks.length === 0) return;
		const previousIndex =
			playMode === "random" ? pickRandomIndex() : currentTrackIndex - 1;
		changeTrack(previousIndex);
	}

	function handleEnded(): void {
		if (playMode === "loop") {
			if (!audioElement) return;
			audioElement.currentTime = 0;
			playCurrentTrack();
			return;
		}
		playNext();
	}

	function selectTrack(trackId: string): void {
		const nextIndex = getTrackIndex(trackId);
		if (nextIndex < 0) return;
		changeTrack(nextIndex);
	}

	function seek(event: MouseEvent): void {
		if (!audioElement || !duration) return;
		const currentTarget = event.currentTarget;
		if (!(currentTarget instanceof HTMLElement)) return;
		const rect = currentTarget.getBoundingClientRect();
		const ratio = Math.min(
			1,
			Math.max(0, (event.clientX - rect.left) / rect.width),
		);
		audioElement.currentTime = ratio * duration;
	}

	function cycleMode(): void {
		playMode =
			playMode === "order"
				? "loop"
				: playMode === "loop"
					? "random"
					: "order";
	}

	function modeLabel(mode: PlayMode): string {
		if (mode === "loop") return translate(Key.musicModeLoop, $language);
		if (mode === "random") return translate(Key.musicModeRandom, $language);
		return translate(Key.musicModeOrder, $language);
	}

	function updateTime(): void {
		if (!audioElement) return;
		currentTime = audioElement.currentTime;
		duration = audioElement.duration || 0;
	}

	async function loadLyrics(track: MusicTrack | null): Promise<void> {
		const nextTrackId = track?.id ?? "";
		lyricTrackId = nextTrackId;
		lastScrolledLyricIndex = -2;

		if (!track?.lyricUrl) {
			lyricLines = [];
			lyricsLoading = false;
			return;
		}

		lyricsLoading = true;
		try {
			const lines = await loadLrcLines(track.lyricUrl);
			if (lyricTrackId !== nextTrackId) return;
			lyricLines = lines;
		} catch {
			if (lyricTrackId !== nextTrackId) return;
			lyricLines = [];
		} finally {
			if (lyricTrackId === nextTrackId) {
				lyricsLoading = false;
			}
		}
	}

	function seekToLyric(time: number): void {
		if (!audioElement) return;
		audioElement.currentTime = time;
		updateTime();
		if (!isPlaying) {
			playCurrentTrack();
		}
	}

	async function scrollActiveLyricIntoView(index: number): Promise<void> {
		if (!lyricContainer || index < 0) return;
		await tick();
		const activeLine = lyricContainer.querySelector<HTMLElement>(
			`[data-lyric-index="${index}"]`,
		);
		if (!activeLine) return;

		const targetTop =
			activeLine.offsetTop - lyricContainer.clientHeight / 2 + activeLine.clientHeight / 2;
		const maxScrollTop = Math.max(
			0,
			lyricContainer.scrollHeight - lyricContainer.clientHeight,
		);

		lyricContainer.scrollTo({
			top: Math.min(maxScrollTop, Math.max(0, targetTop)),
			behavior: "smooth",
		});
	}

	function syncPauseState(): void {
		isPlaying = false;
	}

	function syncPlayState(): void {
		isPlaying = true;
	}

	$: progress = duration > 0 ? (currentTime / duration) * 100 : 0;
	$: activeLyricIndex = getActiveLyricIndex(currentTime, lyricLines);
	$: stageStyle = currentTrack?.cover
		? `--music-stage-cover: url('${currentTrack.cover}');`
		: "";
	$: if ((currentTrack?.id ?? "") !== lyricTrackId) {
		void loadLyrics(currentTrack);
	}
	$: if (activeLyricIndex !== lastScrolledLyricIndex) {
		lastScrolledLyricIndex = activeLyricIndex;
		void scrollActiveLyricIntoView(activeLyricIndex);
	}

	const icons = {
		next:
			"M6.7 5.4a1 1 0 0 1 1.6-.8l8.4 6.4a1 1 0 0 1 0 1.6l-8.4 6.4A1 1 0 0 1 6.7 18zm10.8-.2h1.8v13.6h-1.8z",
		pause: "M7 5.2h3.2v13.6H7zm6.8 0H17v13.6h-3.2z",
		play: "M8 5.8a1 1 0 0 1 1.5-.9l8 5.1a1 1 0 0 1 0 1.7l-8 5.1A1 1 0 0 1 8 16z",
		prev:
			"M17.3 5.4a1 1 0 0 0-1.6-.8l-8.4 6.4a1 1 0 0 0 0 1.6l8.4 6.4a1 1 0 0 0 1.6-.8zm-10.8-.2H4.7v13.6h1.8z",
	};
</script>

<div class="music-shell text-90">
	<section class="music-hero card-base">
		<div>
			<p class="music-kicker">{translate(Key.musicPlaylist, $language)}</p>
			<h1 class="music-title">{translate(Key.music, $language)}</h1>
			<p class="music-description text-50">{translate(Key.musicDescription, $language)}</p>
		</div>
		<div class="music-summary">
			<span>{tracks.length}</span>
			<small class="text-50">{translate(Key.musicTrackCount, $language)}</small>
		</div>
	</section>

	{#if !enabled}
		<section class="music-state card-base text-50">{translate(Key.musicDisabled, $language)}</section>
	{:else if errorMessage}
		<section class="music-state card-base text-50">
			{translate(Key.musicLoadFailed, $language)}{errorMessage}
		</section>
	{:else if tracks.length === 0}
		<section class="music-state card-base text-50">{translate(Key.musicEmpty, $language)}</section>
	{:else}
		<div class="music-player">
			<aside class="music-sidebar card-base text-90">
				<div class="music-sidebar__header">
					<div>
						<h2>{translate(Key.musicPlaylist, $language)}</h2>
						<p class="text-50">{tracks.length} {translate(Key.musicTrackCount, $language)}</p>
					</div>
					<label class="music-search">
						<span class="sr-only">{translate(Key.musicPlaylistSearch, $language)}</span>
						<input
							bind:value={search}
							type="search"
							placeholder={translate(Key.musicPlaylistSearch, $language)}
						/>
					</label>
				</div>

				<div class="music-list">
					{#if filteredTracks.length === 0}
						<div class="music-list__empty text-50">{translate(Key.musicNoMatch, $language)}</div>
					{:else}
						{#each filteredTracks as track}
							<button
								type="button"
								class:active={currentTrack?.id === track.id}
								class="music-track text-90"
								on:click={() => selectTrack(track.id)}
							>
								<div class="music-track__cover">
									{#if track.cover}
										<img
											src={track.cover}
											alt={track.title}
											loading="lazy"
											referrerpolicy="no-referrer"
										/>
									{:else}
										<span>♪</span>
									{/if}
								</div>
								<div class="music-track__meta">
									<strong>{track.title}</strong>
									<span class="text-50">{track.artist || translate(Key.musicUnknownArtist, $language)}</span>
								</div>
								<small class="text-50">{track.duration || "--:--"}</small>
							</button>
						{/each}
					{/if}
				</div>
			</aside>

			<section class="music-stage card-base text-90" style={stageStyle}>
				<div class="music-now">
					<div class:playing={isPlaying} class="music-cover">
						{#if currentTrack?.cover}
							<img
								src={currentTrack.cover}
								alt={currentTrack.title}
								referrerpolicy="no-referrer"
							/>
						{:else}
							<span>♫</span>
						{/if}
					</div>

					<div class="music-info">
						<p class="music-info__kicker">{translate(Key.musicNowPlaying, $language)}</p>
						<h2>{currentTrack?.title}</h2>
						<p class="text-50">
							{currentTrack?.artist || translate(Key.musicUnknownArtist, $language)}
						</p>

						<div class="music-tags">
							<span class="text-50">{currentTrack?.album || translate(Key.musicUnknownAlbum, $language)}</span>
							{#if currentTrack?.uploader}
								<span class="text-50">{translate(Key.musicUploader, $language)}: {currentTrack.uploader}</span>
							{/if}
						</div>

						<div class="music-links">
							{#if currentTrack?.artistHome}
								<a
									href={currentTrack.artistHome}
									target="_blank"
									rel="noopener noreferrer"
									referrerpolicy="no-referrer"
									class="text-90"
								>
									<span class="music-link__label">
										{translate(Key.musicArtistHome, $language)}
									</span>
									<svg viewBox="0 0 24 24" aria-hidden="true" class="music-link__icon">
										<path
											d="M7 17 17 7m-6 0h6v6"
											fill="none"
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="1.8"
										/>
									</svg>
								</a>
							{/if}
							{#if currentTrack?.videoUrl}
								<a
									href={currentTrack.videoUrl}
									target="_blank"
									rel="noopener noreferrer"
									referrerpolicy="no-referrer"
									class="text-90"
								>
									<span class="music-link__label">
										{translate(Key.musicVideoLink, $language)}
									</span>
									<svg viewBox="0 0 24 24" aria-hidden="true" class="music-link__icon">
										<path
											d="M7 17 17 7m-6 0h6v6"
											fill="none"
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="1.8"
										/>
									</svg>
								</a>
							{/if}
						</div>
					</div>
				</div>

				<div class="music-lyrics">
					<div class="music-lyrics__header">
						<h3>{translate(Key.musicLyrics, $language)}</h3>
					</div>
					{#if lyricsLoading}
						<p class="music-lyrics__state text-50">
							{translate(Key.musicLyricsLoading, $language)}
						</p>
					{:else if lyricLines.length === 0}
						<p class="music-lyrics__state text-50">
							{translate(Key.musicLyricsUnavailable, $language)}
						</p>
					{:else}
						<div bind:this={lyricContainer} class="music-lyrics__list">
							{#each lyricLines as line, index}
								<button
									type="button"
									class:active={index === activeLyricIndex}
									class="music-lyrics__line text-50"
									data-lyric-index={index}
									on:click={() => seekToLyric(line.time)}
								>
									{line.text || "♪"}
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<div class="music-progress">
					<button
						type="button"
						class="music-progress__bar"
						aria-label={translate(Key.musicNowPlaying, $language)}
						on:click={seek}
					>
						<span class="music-progress__fill" style={`width: ${progress}%`}>
							<span class="music-progress__thumb"></span>
						</span>
					</button>
					<div class="music-progress__meta text-50">
						<span>{formatTime(currentTime)}</span>
						<span>{currentTrack?.duration || formatTime(duration)}</span>
					</div>
				</div>

				<div class="music-controls">
					<div class="music-controls__main">
						<button
							type="button"
							class="music-icon-button text-90"
							aria-label={translate(Key.musicPrevious, $language)}
							on:click={playPrevious}
						>
							<svg viewBox="0 0 24 24" aria-hidden="true" class="music-button-icon">
								<path d={icons.prev} fill="currentColor"></path>
							</svg>
						</button>
						<button
							type="button"
							class="music-icon-button music-icon-button--primary text-90"
							aria-label={isPlaying
								? translate(Key.musicPause, $language)
								: translate(Key.musicPlay, $language)}
							on:click={togglePlay}
						>
							<svg viewBox="0 0 24 24" aria-hidden="true" class="music-button-icon music-button-icon--primary">
								<path d={isPlaying ? icons.pause : icons.play} fill="currentColor"></path>
							</svg>
						</button>
						<button
							type="button"
							class="music-icon-button text-90"
							aria-label={translate(Key.musicNext, $language)}
							on:click={playNext}
						>
							<svg viewBox="0 0 24 24" aria-hidden="true" class="music-button-icon">
								<path d={icons.next} fill="currentColor"></path>
							</svg>
						</button>
					</div>

					<div class="music-controls__secondary">
						<button
							type="button"
							class="music-chip-button text-90"
							aria-label={translate(Key.musicPlayMode, $language)}
							on:click={cycleMode}
						>
							{modeLabel(playMode)}
						</button>

						<label class="music-range text-50">
							<span>{translate(Key.musicVolume, $language)}</span>
							<input bind:value={volume} type="range" min="0" max="1" step="0.01" />
						</label>

						<label class="music-speed text-50">
							<span>{translate(Key.musicSpeed, $language)}</span>
							<select bind:value={speedValue}>
								<option value="0.5">0.5x</option>
								<option value="0.75">0.75x</option>
								<option value="1">1.0x</option>
								<option value="1.25">1.25x</option>
								<option value="1.5">1.5x</option>
								<option value="2">2.0x</option>
							</select>
						</label>
					</div>
				</div>

				<audio
					bind:this={audioElement}
					src={currentTrack?.sourceUrl}
					preload="metadata"
					referrerpolicy="no-referrer"
					on:timeupdate={updateTime}
					on:loadedmetadata={updateTime}
					on:pause={syncPauseState}
					on:play={syncPlayState}
					on:ended={handleEnded}
				></audio>
			</section>
		</div>
	{/if}
</div>

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.music-shell {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.music-hero {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.5rem;
		overflow: hidden;
		background:
			radial-gradient(
				circle at top left,
				rgba(var(--primary), 0.16),
				transparent 42%
			),
			linear-gradient(135deg, rgba(var(--primary), 0.07), transparent 58%);
	}

	.music-kicker {
		margin: 0 0 0.4rem;
		font-size: 0.72rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: rgba(var(--primary), 0.9);
	}

	.music-title {
		margin: 0 0 0.5rem;
		font-size: 2rem;
		font-weight: 700;
	}

	.music-description {
		margin: 0;
		font-size: 1rem;
		line-height: 1.65;
		opacity: 0.72;
	}

	.music-summary {
		display: grid;
		place-items: center;
		min-width: 7rem;
		padding: 0.85rem 1rem;
		border: 1px solid rgba(var(--primary), 0.22);
		background: rgba(var(--primary), 0.06);
		border-radius: 0.9rem;
	}

	.music-summary span {
		font-size: 1.8rem;
		font-weight: 700;
		line-height: 1;
	}

	.music-summary small {
		margin-top: 0.3rem;
		opacity: 0.68;
	}

	.music-player {
		display: grid;
		grid-template-columns: minmax(17rem, 22rem) minmax(0, 1fr);
		gap: 1rem;
	}

	.music-sidebar {
		display: flex;
		flex-direction: column;
		min-height: 40rem;
		padding: 1rem;
	}

	.music-sidebar__header {
		display: grid;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.music-sidebar__header h2,
	.music-info h2 {
		margin: 0;
		font-size: 1.35rem;
		font-weight: 700;
	}

	.music-sidebar__header p,
	.music-info p {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.6;
		opacity: 0.72;
	}

	.music-search input,
	.music-speed select,
	.music-range input {
		width: 100%;
	}

	.music-search input,
	.music-speed select {
		border: 1px solid rgba(var(--primary), 0.3);
		background: rgba(var(--primary), 0.05);
		color: inherit;
		padding: 0.75rem 0.85rem;
		outline: none;
		border-radius: 0.8rem;
	}

	.music-list {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 0.6rem;
		overflow-y: auto;
		padding-right: 0.2rem;
	}

	.music-list__empty,
	.music-state {
		padding: 1.25rem;
		opacity: 0.7;
	}

	.music-track {
		display: grid;
		grid-template-columns: 3rem minmax(0, 1fr) auto;
		gap: 0.75rem;
		align-items: center;
		padding: 0.7rem;
		border: 1px solid rgba(var(--primary), 0.12);
		background: transparent;
		color: inherit;
		text-align: left;
		cursor: pointer;
		transition:
			transform 0.2s ease,
			border-color 0.2s ease,
			background 0.2s ease;
	}

	.music-track:hover,
	.music-track.active {
		transform: translateY(-2px);
		border-color: rgba(var(--primary), 0.36);
		background: rgba(var(--primary), 0.14);
		box-shadow: 0 14px 35px rgba(0, 0, 0, 0.1);
	}

	.music-track__cover,
	.music-cover {
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background: rgba(var(--primary), 0.12);
	}

	.music-track__cover {
		width: 3rem;
		height: 3rem;
		border-radius: 0.75rem;
	}

	.music-track__cover img,
	.music-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.music-track__meta {
		min-width: 0;
	}

	.music-track__meta strong,
	.music-track__meta span {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.music-track__meta span,
	.music-track small {
		opacity: 0.65;
	}

	.music-track__meta strong {
		margin-bottom: 0.2rem;
		font-size: 1rem;
		font-weight: 700;
	}

	.music-track__meta span,
	.music-track small {
		font-size: 0.88rem;
	}

	.music-stage {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 1.4rem;
		gap: 1.4rem;
		overflow: hidden;
	}

	.music-stage::before {
		content: "";
		position: absolute;
		inset: 0;
		background:
			radial-gradient(
				circle at top right,
				rgba(var(--primary), 0.16),
				transparent 36%
			),
			linear-gradient(135deg, rgba(var(--primary), 0.05), transparent 58%);
		pointer-events: none;
	}

	.music-stage::after {
		content: "";
		position: absolute;
		inset: 0;
		background-image: var(--music-stage-cover, none);
		background-position: center;
		background-size: cover;
		opacity: 0.06;
		filter: blur(12px);
		transform: scale(1.08);
		pointer-events: none;
	}

	.music-now {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: minmax(8rem, 12rem) minmax(0, 1fr);
		gap: 1.25rem;
		align-items: center;
	}

	.music-cover {
		aspect-ratio: 1;
		border-radius: 50%;
		border: 1px solid rgba(var(--primary), 0.28);
		box-shadow: 0 16px 36px rgba(0, 0, 0, 0.14);
	}

	.music-cover.playing {
		animation: spin 12s linear infinite;
	}

	.music-info__kicker {
		margin-bottom: 0.5rem;
		font-size: 0.75rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: rgba(var(--primary), 0.9);
	}

	.music-tags,
	.music-links,
	.music-controls__main,
	.music-controls__secondary,
	.music-progress__meta {
		position: relative;
		z-index: 1;
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
	}

	.music-tags span,
	.music-chip-button {
		padding: 0.45rem 0.75rem;
		border: 1px solid rgba(var(--primary), 0.24);
		background: rgba(var(--primary), 0.05);
		color: inherit;
		text-decoration: none;
		border-radius: 999px;
	}

	.music-links a {
		display: inline-flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.9rem;
		min-width: 9.75rem;
		padding: 0.7rem 0.9rem;
		border: 1px solid rgba(var(--primary), 0.18);
		background:
			radial-gradient(
				circle at top left,
				rgba(var(--primary), 0.14),
				transparent 45%
			),
			linear-gradient(135deg, rgba(var(--primary), 0.06), transparent 60%);
		color: inherit;
		text-decoration: none;
		border-radius: 0.85rem;
		transition:
			transform 0.2s ease,
			border-color 0.2s ease,
			box-shadow 0.2s ease,
			background 0.2s ease;
	}

	.music-link__label {
		font-size: 0.95rem;
		font-weight: 600;
	}

	.music-link__icon {
		flex: 0 0 auto;
		width: 1rem;
		height: 1rem;
		color: rgb(var(--primary));
		opacity: 0.8;
	}

	.music-links a:hover,
	.music-chip-button:hover,
	.music-icon-button:hover {
		border-color: rgba(var(--primary), 0.42);
		background: rgba(var(--primary), 0.18);
	}

	.music-links a:hover {
		transform: translateY(-2px);
		box-shadow: 0 14px 35px rgba(0, 0, 0, 0.1);
	}

	.music-lyrics {
		position: relative;
		z-index: 1;
		display: grid;
		gap: 0.75rem;
		padding: 1rem 1.1rem;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 1rem;
		background: rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(18px);
	}

	.music-lyrics__header h3 {
		margin: 0;
		font-size: 0.92rem;
		font-weight: 600;
		letter-spacing: 0.04em;
	}

	.music-lyrics__state {
		margin: 0;
		font-size: 0.92rem;
		line-height: 1.7;
	}

	.music-lyrics__list {
		display: grid;
		gap: 0.35rem;
		max-height: 16rem;
		overflow-y: auto;
		padding-right: 0.2rem;
		scrollbar-width: thin;
	}

	.music-lyrics__line {
		padding: 0.5rem 0.65rem;
		border: none;
		border-radius: 0.8rem;
		background: transparent;
		text-align: left;
		line-height: 1.7;
		transition:
			color 0.2s ease,
			background-color 0.2s ease,
			transform 0.2s ease;
	}

	.music-lyrics__line:hover,
	.music-lyrics__line.active {
		color: rgba(var(--primary), 0.98);
		background: rgba(var(--primary), 0.12);
	}

	.music-lyrics__line.active {
		transform: translateX(0.2rem);
		font-weight: 600;
	}

	.music-progress {
		position: relative;
		z-index: 1;
		display: grid;
		gap: 0.6rem;
	}

	.music-progress__bar {
		position: relative;
		height: 1rem;
		padding: 0;
		border: 1px solid rgba(var(--primary), 0.14);
		background:
			linear-gradient(180deg, rgba(var(--primary), 0.05), rgba(var(--primary), 0.09)),
			rgba(var(--primary), 0.04);
		cursor: pointer;
		overflow: hidden;
		border-radius: 999px;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
	}

	.music-progress__fill {
		position: relative;
		display: block;
		height: 100%;
		border-radius: 999px;
		background: linear-gradient(90deg, rgba(var(--primary), 0.88), #79d1ff);
		box-shadow:
			0 0 18px rgba(var(--primary), 0.18),
			inset 0 1px 0 rgba(255, 255, 255, 0.18);
		min-width: 0;
	}

	.music-progress__thumb {
		position: absolute;
		top: 50%;
		right: 0;
		width: 0.95rem;
		height: 0.95rem;
		border: 2px solid rgba(255, 255, 255, 0.9);
		border-radius: 50%;
		background: rgb(var(--primary));
		box-shadow:
			0 0 0 4px rgba(var(--primary), 0.14),
			0 8px 20px rgba(0, 0, 0, 0.18);
		transform: translate(50%, -50%);
	}

	.music-progress__meta {
		justify-content: space-between;
		opacity: 0.72;
		font-variant-numeric: tabular-nums;
	}

	.music-controls {
		position: relative;
		z-index: 1;
		display: grid;
		gap: 1rem;
	}

	.music-controls__main {
		justify-content: center;
	}

	.music-controls__secondary {
		justify-content: space-between;
	}

	.music-icon-button,
	.music-chip-button {
		border: 1px solid rgba(var(--primary), 0.25);
		background: rgba(var(--primary), 0.05);
		color: inherit;
		border-radius: 0.85rem;
	}

	.music-icon-button {
		display: grid;
		place-items: center;
		width: 3.1rem;
		height: 3.1rem;
		font-size: 1.1rem;
		transition:
			transform 0.2s ease,
			border-color 0.2s ease,
			box-shadow 0.2s ease,
			background 0.2s ease;
	}

	.music-button-icon {
		width: 1.2rem;
		height: 1.2rem;
	}

	.music-icon-button--primary {
		width: 3.6rem;
		height: 3.6rem;
		background:
			radial-gradient(
				circle at top left,
				rgba(var(--primary), 0.2),
				transparent 45%
			),
			linear-gradient(135deg, rgba(var(--primary), 0.1), transparent 58%);
		color: rgb(var(--primary));
		font-size: 1.35rem;
	}

	.music-button-icon--primary {
		width: 1.35rem;
		height: 1.35rem;
	}

	.music-range,
	.music-speed {
		display: grid;
		gap: 0.45rem;
		min-width: 11rem;
		opacity: 0.82;
	}

	.music-range input {
		accent-color: rgb(var(--primary));
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}

		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 960px) {
		.music-player,
		.music-now {
			grid-template-columns: 1fr;
		}

		.music-sidebar {
			min-height: 24rem;
		}

		.music-cover {
			width: min(16rem, 55vw);
			margin: 0 auto;
		}
	}

	@media (max-width: 640px) {
		.music-hero,
		.music-player,
		.music-stage,
		.music-sidebar {
			padding: 1rem;
		}

		.music-hero {
			align-items: flex-start;
			flex-direction: column;
		}

		.music-title {
			font-size: 1.7rem;
		}

		.music-controls__secondary {
			flex-direction: column;
			align-items: stretch;
		}

		.music-lyrics {
			padding: 0.9rem;
		}

		.music-range,
		.music-speed {
			min-width: 0;
		}
	}
</style>

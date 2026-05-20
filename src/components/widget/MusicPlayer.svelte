<script lang="ts">
	import Icon from "@iconify/svelte";
	import { language, translate } from "@/i18n/client";
	import Key from "@/i18n/i18nKey";
	import { loadLrcLines, type MusicLyricLine } from "@/utils/music-lrc";
	import type { MusicTrack } from "@/utils/music";
	import { tick } from "svelte";
	import { cubicOut } from "svelte/easing";
	import { slide } from "svelte/transition";

	export let tracks: MusicTrack[] = [];
	export let musicPageUrl = "/music/";

	type PlayMode = "order" | "loop" | "random";

	let audio: HTMLAudioElement | null = null;
	let currentIndex = 0;
	let currentTime = 0;
	let duration = 0;
	let isPlaying = false;
	let volume = 0.7;
	let isMuted = false;
	let playMode: PlayMode = "order";
	let showPlaylist = false;
	let showLyrics = false;
	let lyricContainer: HTMLElement | null = null;
	let lyricLines: MusicLyricLine[] = [];
	let lyricsLoading = false;
	let lyricTrackId = "";
	let lastScrolledLyricIndex = -2;
	let lastLyricsVisibility = false;
	const coverSize = 52;

	$: currentTrack = tracks[currentIndex] ?? null;
	$: progress = duration > 0 ? (currentTime / duration) * 100 : 0;
	$: volumeProgress = (isMuted ? 0 : volume) * 100;
	$: activeLyricIndex = getActiveLyricIndex(currentTime, lyricLines);

	function formatTime(seconds: number): string {
		if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
		const minutes = Math.floor(seconds / 60);
		const remain = Math.floor(seconds % 60);
		return `${minutes}:${String(remain).padStart(2, "0")}`;
	}

	function updatePlayState(next: boolean): void {
		isPlaying = next;
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

	function loadTrack(index: number, autoplay = false): void {
		if (tracks.length === 0) return;
		currentIndex = (index + tracks.length) % tracks.length;
		currentTime = 0;
		duration = 0;

		if (!audio || !currentTrack) return;
		audio.src = currentTrack.sourceUrl;
		audio.load();

		if (autoplay) {
			audio.play().then(() => updatePlayState(true)).catch(() => updatePlayState(false));
		} else {
			updatePlayState(false);
		}
	}

	function togglePlay(): void {
		if (!audio || !currentTrack) return;
		if (audio.paused) {
			audio.play().then(() => updatePlayState(true)).catch(() => updatePlayState(false));
			return;
		}
		audio.pause();
		updatePlayState(false);
	}

	function toggleMute(): void {
		if (!audio) return;
		isMuted = !isMuted;
		audio.muted = isMuted;
	}

	function pickRandomIndex(): number {
		if (tracks.length <= 1) return currentIndex;
		let nextIndex = currentIndex;
		while (nextIndex === currentIndex) {
			nextIndex = Math.floor(Math.random() * tracks.length);
		}
		return nextIndex;
	}

	function playNext(): void {
		loadTrack(playMode === "random" ? pickRandomIndex() : currentIndex + 1, true);
	}

	function playPrevious(): void {
		loadTrack(playMode === "random" ? pickRandomIndex() : currentIndex - 1, true);
	}

	function cyclePlayMode(): void {
		playMode =
			playMode === "order"
				? "loop"
				: playMode === "loop"
					? "random"
					: "order";
	}

	function getPlayModeIcon(mode: PlayMode): string {
		if (mode === "loop") return "material-symbols:repeat-one-rounded";
		if (mode === "random") return "material-symbols:shuffle-rounded";
		return "material-symbols:repeat-rounded";
	}

	function getPlayModeLabel(mode: PlayMode): string {
		if (mode === "loop") return translate(Key.musicModeLoop, $language);
		if (mode === "random") return translate(Key.musicModeRandom, $language);
		return translate(Key.musicModeOrder, $language);
	}

	function handleEnded(): void {
		if (playMode === "loop") {
			if (!audio) return;
			audio.currentTime = 0;
			audio.play().then(() => updatePlayState(true)).catch(() => updatePlayState(false));
			return;
		}
		playNext();
	}

	function togglePlaylist(): void {
		showPlaylist = !showPlaylist;
	}

	function toggleLyrics(): void {
		showLyrics = !showLyrics;
	}

	function playTrack(index: number): void {
		if (index === currentIndex && !audio?.paused) {
			togglePlay();
			return;
		}
		loadTrack(index, true);
	}

	function seek(event: MouseEvent): void {
		if (!audio || !duration) return;
		const element = event.currentTarget;
		if (!(element instanceof HTMLElement)) return;
		const rect = element.getBoundingClientRect();
		const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
		audio.currentTime = ratio * duration;
	}

	function changeVolume(event: MouseEvent): void {
		if (!audio) return;
		const element = event.currentTarget;
		if (!(element instanceof HTMLElement)) return;
		const rect = element.getBoundingClientRect();
		volume = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
		isMuted = false;
		audio.volume = volume;
		audio.muted = false;
	}

	function onTimeUpdate(): void {
		if (!audio) return;
		currentTime = audio.currentTime;
		duration = audio.duration || 0;
	}

	function onAudioReady(): void {
		if (!audio) return;
		audio.volume = volume;
		audio.muted = isMuted;
		onTimeUpdate();
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
		if (!audio) return;
		audio.currentTime = time;
		onTimeUpdate();
		if (audio.paused) {
			audio.play().then(() => updatePlayState(true)).catch(() => updatePlayState(false));
		}
	}

	async function scrollActiveLyricIntoView(index: number): Promise<void> {
		if (!showLyrics || !lyricContainer || index < 0) return;
		await tick();
		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
		const activeLine = lyricContainer.querySelector<HTMLElement>(
			`[data-lyric-index="${index}"]`,
		);
		if (!activeLine) return;

		const containerRect = lyricContainer.getBoundingClientRect();
		const activeRect = activeLine.getBoundingClientRect();
		const targetTop =
			lyricContainer.scrollTop +
			(activeRect.top - containerRect.top) -
			lyricContainer.clientHeight / 2 +
			activeLine.clientHeight / 2;
		const maxScrollTop = Math.max(
			0,
			lyricContainer.scrollHeight - lyricContainer.clientHeight,
		);

		lyricContainer.scrollTo({
			top: Math.min(maxScrollTop, Math.max(0, targetTop)),
			behavior: "smooth",
		});
	}

	$: if ((currentTrack?.id ?? "") !== lyricTrackId) {
		void loadLyrics(currentTrack);
	}
	$: if (activeLyricIndex !== lastScrolledLyricIndex) {
		lastScrolledLyricIndex = activeLyricIndex;
		void scrollActiveLyricIntoView(activeLyricIndex);
	}
	$: if (showLyrics && !lastLyricsVisibility) {
		lastLyricsVisibility = true;
		void scrollActiveLyricIntoView(activeLyricIndex);
	}
	$: if (!showLyrics && lastLyricsVisibility) {
		lastLyricsVisibility = false;
	}
</script>

{#if tracks.length === 0}
	<div class="rounded-xl border border-white/10 bg-white/30 px-4 py-4 text-sm text-50 dark:bg-white/5">
		{translate(Key.musicEmpty, $language)}
	</div>
{:else}
	<div class="firefly-music-player relative w-full transition-all duration-300 text-90">
		<div class="mb-2 flex items-center gap-2 px-1">
			<div class="group relative shrink-0" style={`width: ${coverSize}px; height: ${coverSize}px; min-width: ${coverSize}px; min-height: ${coverSize}px;`}>
				<a
					href={musicPageUrl}
					class="relative z-10 flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[rgba(var(--primary),0.1)] shadow-lg dark:border-neutral-700"
					aria-label={translate(Key.music, $language)}
				>
					{#if !currentTrack?.cover}
						<Icon
							icon="mdi:music-note"
							aria-hidden="true"
							class="absolute text-lg text-[rgb(var(--primary))] opacity-40"
						/>
					{/if}
						{#if currentTrack?.cover}
							<img
								class:animate-spin-slow={isPlaying}
								class="music-cover relative z-10 block h-full w-full object-cover transition-opacity duration-300"
								src={currentTrack.cover}
								alt={currentTrack.title}
								loading="lazy"
								referrerpolicy="no-referrer"
								width={coverSize}
								height={coverSize}
								style={`animation-play-state: ${isPlaying ? "running" : "paused"};`}
							/>
						{/if}
				</a>
			</div>

			<div class="flex min-w-0 flex-1 flex-col overflow-hidden">
				<div class="flex items-center justify-between gap-2 overflow-hidden">
					<div class="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
						<a href={musicPageUrl} class="block min-w-0 flex-1 overflow-hidden">
							<h3 class="music-title truncate text-lg font-bold leading-tight text-70">
								{currentTrack?.title}
							</h3>
						</a>
						<button
							type="button"
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition-colors duration-200 hover:text-[rgb(var(--primary))] active:scale-95"
							aria-label={translate(Key.musicLyrics, $language)}
							aria-pressed={showLyrics}
							style={showLyrics ? "color: rgb(var(--primary)); background: rgba(var(--primary), 0.12);" : ""}
							on:click={toggleLyrics}
						>
							<Icon
								icon={showLyrics
									? "material-symbols:subtitles-off-outline-rounded"
									: "material-symbols:subtitles-outline-rounded"}
								aria-hidden="true"
								class="text-2xl"
							/>
						</button>
					</div>
				</div>

				<div class="min-w-0 overflow-hidden">
					<p class="music-artist truncate text-xs font-medium text-50">
						{currentTrack?.artist || translate(Key.musicUnknownArtist, $language)}
					</p>
				</div>

				<div class="flex h-5 items-center gap-3 text-neutral-400">
					<div class="flex h-full shrink-0 items-center gap-1 font-mono text-[10px]" aria-live="polite">
						<span class="current-time text-50">{formatTime(currentTime)}</span>
						<span class="opacity-50" aria-hidden="true">/</span>
						<span class="total-time text-50">
							{currentTrack?.duration || formatTime(duration)}
						</span>
					</div>

					<div class="ml-auto flex h-full items-center gap-1 bg-transparent">
						<button
							class="btn-mute flex items-center rounded-md p-0.5 text-neutral-400 transition-all duration-300 hover:text-[rgb(var(--primary))] active:scale-95"
							type="button"
							aria-label="Volume"
							on:click={toggleMute}
						>
							{#if isMuted || volume === 0}
								<Icon icon="mdi:volume-off" aria-hidden="true" class="text-lg" />
							{:else}
								<Icon icon="mdi:volume-high" aria-hidden="true" class="text-lg" />
							{/if}
						</button>
						<div class="flex w-16 items-center transition-all duration-300 ease-out">
							<button
								type="button"
								class="vol-container relative ml-1 h-1.5 w-16 cursor-pointer rounded-full bg-neutral-200/90 dark:bg-neutral-600/90"
								role="slider"
								aria-label="Volume"
								aria-valuemin="0"
								aria-valuemax="100"
								aria-valuenow={Math.round(volumeProgress)}
								on:click={changeVolume}
							>
								<span
									class="vol-bar absolute left-0 top-0 h-full rounded-full bg-[var(--primary)] shadow-[0_0_0_1px_rgba(255,255,255,0.12)] transition-[width]"
									style={`width: ${volumeProgress}%`}
								></span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="px-1">
			<button
				type="button"
				class="progress-container group relative mb-2 mt-2 h-1.5 w-full cursor-pointer touch-none rounded-full bg-neutral-100 dark:bg-neutral-700/50"
				role="slider"
				aria-label={translate(Key.musicNowPlaying, $language)}
				aria-valuemin="0"
				aria-valuemax="100"
				aria-valuenow={Math.round(progress)}
				on:click={seek}
			>
				<span
					class="progress-bar absolute left-0 top-0 h-full rounded-full bg-[var(--primary)] shadow-[0_0_0_1px_rgba(255,255,255,0.12)] transition-[width] duration-100"
					style={`width: ${progress}%`}
				></span>
			</button>
		</div>

		<div class="flex select-none items-center justify-between px-1">
			<button
				class="btn-random p-2 text-neutral-600 transition-colors hover:text-[var(--primary)] active:scale-95 dark:text-neutral-300"
				type="button"
				aria-label={`${translate(Key.musicPlayMode, $language)}: ${getPlayModeLabel(playMode)}`}
				style={playMode !== "order" ? "color: rgb(var(--primary));" : ""}
				on:click={cyclePlayMode}
			>
				<Icon icon={getPlayModeIcon(playMode)} aria-hidden="true" class="text-2xl" />
			</button>

			<button
				class="btn-prev p-2 text-neutral-600 transition-colors hover:text-[var(--primary)] active:scale-95 dark:text-neutral-300"
				type="button"
				aria-label={translate(Key.musicPrevious, $language)}
				on:click={playPrevious}
			>
				<Icon icon="material-symbols:skip-previous-rounded" aria-hidden="true" class="text-3xl" />
			</button>

			<button
				class="btn-play flex h-12 w-12 items-center justify-center rounded-full bg-[var(--btn-regular-bg)] text-[rgb(var(--primary))] transition-all duration-300 hover:bg-[var(--btn-regular-bg-hover)] active:bg-[var(--btn-regular-bg-active)]"
				type="button"
				aria-label={isPlaying
					? translate(Key.musicPause, $language)
					: translate(Key.musicPlay, $language)}
				on:click={togglePlay}
			>
				{#if isPlaying}
					<Icon icon="material-symbols:pause-rounded" aria-hidden="true" class="text-3xl" />
				{:else}
					<Icon icon="material-symbols:play-arrow-rounded" aria-hidden="true" class="ml-0.5 text-3xl" />
				{/if}
			</button>

			<button
				class="btn-next p-2 text-neutral-600 transition-colors hover:text-[rgb(var(--primary))] active:scale-95 dark:text-neutral-300"
				type="button"
				aria-label={translate(Key.musicNext, $language)}
				on:click={playNext}
			>
				<Icon icon="material-symbols:skip-next-rounded" aria-hidden="true" class="text-3xl" />
			</button>

			<button
				class="btn-list p-2 text-neutral-600 transition-colors hover:text-[rgb(var(--primary))] active:scale-95 dark:text-neutral-300"
				type="button"
				aria-label={translate(Key.musicPlaylist, $language)}
				aria-pressed={showPlaylist}
				style={showPlaylist ? "color: rgb(var(--primary));" : ""}
				on:click={togglePlaylist}
			>
				<Icon icon="mdi:playlist-music" aria-hidden="true" class="text-2xl" />
			</button>
		</div>

		{#if showLyrics}
			<div class="mt-3 px-1">
				<div
					class="border-t border-black/8 px-0 pt-3 dark:border-white/10"
					transition:slide={{ duration: 220, axis: "y", easing: cubicOut }}
				>
					<div class="mb-2 flex items-center justify-end gap-2 px-1">
						{#if activeLyricIndex >= 0 && lyricLines[activeLyricIndex]}
							<span class="text-[10px] text-50">{formatTime(lyricLines[activeLyricIndex].time)}</span>
						{/if}
					</div>

					{#if lyricsLoading}
						<p class="px-1 text-xs leading-6 text-50">{translate(Key.musicLyricsLoading, $language)}</p>
					{:else if lyricLines.length === 0}
						<p class="px-1 text-xs leading-6 text-50">{translate(Key.musicLyricsUnavailable, $language)}</p>
					{:else}
						<div
							bind:this={lyricContainer}
							class="max-h-28 overflow-y-auto pr-1"
						>
							{#each lyricLines as line, index}
								<button
									type="button"
									class="block w-full rounded-none px-2 py-2 leading-5 transition-colors first:pt-1 last:pb-1 hover:text-(--primary)"
									class:text-90={index === activeLyricIndex}
									class:text-sm={index !== activeLyricIndex}
									class:text-50={index !== activeLyricIndex}
									data-lyric-index={index}
									style={
										index === activeLyricIndex
											? "background: rgba(var(--primary), 0.08); color: var(--primary); font-weight: 600;"
											: "background: transparent;"
									}
									on:click={() => seekToLyric(line.time)}
								>
									{line.text || "♪"}
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/if}

		{#if showPlaylist}
			<div class="mt-3 px-1">
				<div
					class="border-t border-black/8 px-0 pt-3 dark:border-white/10"
					transition:slide={{ duration: 220, axis: "y", easing: cubicOut }}
				>
					<div class="max-h-48 overflow-y-auto pr-1">
						{#each tracks as track, index}
							<button
								type="button"
								class:active={index === currentIndex}
								class="flex w-full items-center gap-2 px-1 py-2 text-left transition-colors"
								style={
									index === currentIndex
										? "color: rgb(var(--primary)); background: rgba(var(--primary), 0.08); font-weight: 600;"
										: "background: transparent;"
								}
								on:click={() => playTrack(index)}
							>
								<div class="h-8 w-8 shrink-0 overflow-hidden rounded-md bg-[rgba(var(--primary),0.1)]">
									{#if track.cover}
										<img
											src={track.cover}
											alt={track.title}
											loading="lazy"
											referrerpolicy="no-referrer"
											class="h-full w-full object-cover"
										/>
									{:else}
										<div class="flex h-full w-full items-center justify-center text-[rgb(var(--primary))]">
											<Icon icon="mdi:music-note" aria-hidden="true" class="h-4 w-4" />
										</div>
									{/if}
								</div>
								<div class="min-w-0 flex-1">
									<div class="truncate text-xs font-bold">{track.title}</div>
									<div class="truncate text-[10px] text-50">
										{track.artist || translate(Key.musicUnknownArtist, $language)}
									</div>
								</div>
								<div class="text-[10px] text-50">{track.duration || "--:--"}</div>
							</button>
						{/each}
					</div>
				</div>
			</div>
		{/if}

			<audio
				bind:this={audio}
				src={currentTrack?.sourceUrl}
				preload="metadata"
				referrerpolicy="no-referrer"
				on:loadedmetadata={onAudioReady}
				on:timeupdate={onTimeUpdate}
				on:play={() => updatePlayState(true)}
				on:pause={() => updatePlayState(false)}
				on:ended={handleEnded}
			></audio>
	</div>
{/if}

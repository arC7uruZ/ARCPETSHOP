<script lang="ts">
	import { clsx } from 'clsx';
	import { tick } from 'svelte';
	import { Camera, ImagePlus, Upload, X, Circle } from 'lucide-svelte';

	interface Props {
		currentUrl?: string | null;
		name?: string;
		size?: 'sm' | 'md' | 'lg';
		shape?: 'circle' | 'rounded';
		placeholder?: string;
		/** 'user' = câmera frontal, 'environment' = câmera traseira */
		facing?: 'user' | 'environment';
		hasFile?: boolean;
	}

	let {
		currentUrl = null,
		name = 'avatar',
		size = 'md',
		shape = 'circle',
		placeholder = '👤',
		facing = 'user',
		hasFile = $bindable(false)
	}: Props = $props();

	let galleryInput: HTMLInputElement | undefined = $state();
	let videoEl: HTMLVideoElement | undefined = $state();
	let canvasEl: HTMLCanvasElement | undefined = $state();

	let previewUrl = $state<string | null>(null);
	let isDragging = $state(false);
	let cameraOpen = $state(false);
	let cameraError = $state<string | null>(null);
	let stream = $state<MediaStream | null>(null);

	const sizeMap = { sm: 'h-16 w-16', md: 'h-24 w-24', lg: 'h-32 w-32' };
	const textSizeMap = { sm: 'text-2xl', md: 'text-4xl', lg: 'text-5xl' };
	const shapeMap = { circle: 'rounded-full', rounded: 'rounded-2xl' };

	const displayUrl = $derived(previewUrl ?? currentUrl);

	function setFile(file: File) {
		if (!file.type.startsWith('image/')) return;
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		previewUrl = URL.createObjectURL(file);
		hasFile = true;
		if (galleryInput) {
			const dt = new DataTransfer();
			dt.items.add(file);
			galleryInput.files = dt.files;
		}
	}

	function onGalleryChange(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) setFile(file);
	}

	async function openCamera() {
		cameraError = null;

		if (!navigator.mediaDevices?.getUserMedia) {
			cameraError = 'Câmera não suportada neste navegador.';
			return;
		}

		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
				audio: false
			});
			cameraOpen = true;
			await tick(); // aguarda o <video> aparecer no DOM
			if (videoEl) {
				videoEl.srcObject = stream;
				await videoEl.play();
			}
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			if (msg.includes('Permission') || msg.includes('NotAllowed')) {
				cameraError = 'Permissão de câmera negada. Verifique as configurações do navegador.';
			} else if (msg.includes('NotFound') || msg.includes('DevicesNotFound')) {
				cameraError = 'Nenhuma câmera encontrada neste dispositivo.';
			} else {
				cameraError = 'Não foi possível acessar a câmera.';
			}
		}
	}

	function capturePhoto() {
		if (!videoEl || !canvasEl) return;
		canvasEl.width = videoEl.videoWidth;
		canvasEl.height = videoEl.videoHeight;
		canvasEl.getContext('2d')?.drawImage(videoEl, 0, 0);
		canvasEl.toBlob(
			(blob) => {
				if (!blob) return;
				const file = new File([blob], `foto_${Date.now()}.jpg`, { type: 'image/jpeg' });
				setFile(file);
				closeCamera();
			},
			'image/jpeg',
			0.92
		);
	}

	function closeCamera() {
		stream?.getTracks().forEach((t) => t.stop());
		stream = null;
		cameraOpen = false;
		cameraError = null;
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		const file = e.dataTransfer?.files[0];
		if (file) setFile(file);
	}
	function onDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}
	function onDragLeave(e: DragEvent) {
		const target = e.currentTarget as Element;
		if (!target.contains(e.relatedTarget as Node)) isDragging = false;
	}

	$effect(() => {
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
			stream?.getTracks().forEach((t) => t.stop());
		};
	});
</script>

<!-- Camera overlay (portal-like, fixed to viewport) -->
{#if cameraOpen}
	<div class="fixed inset-0 z-[200] flex flex-col bg-black">
		<!-- Header -->
		<div class="flex shrink-0 items-center justify-between px-4 py-3">
			<span class="text-sm font-medium text-white">Tirar foto</span>
			<button
				type="button"
				onclick={closeCamera}
				class="rounded-full p-2 text-white transition-colors hover:bg-white/20"
				aria-label="Fechar câmera"
			>
				<X class="h-5 w-5" />
			</button>
		</div>

		<!-- Video -->
		<div class="relative flex flex-1 items-center justify-center overflow-hidden">
			<!-- svelte-ignore a11y_media_has_caption -->
			<video
				bind:this={videoEl}
				class="h-full w-full object-cover"
				playsinline
				muted
				autoplay
			></video>

			<!-- Guia visual (círculo/quadrado) -->
			<div
				class={clsx(
					'pointer-events-none absolute border-2 border-white/70',
					shape === 'circle'
						? 'aspect-square w-64 rounded-full'
						: 'aspect-square w-64 rounded-2xl'
				)}
			></div>
		</div>

		<!-- Capture button -->
		<div class="flex shrink-0 items-center justify-center py-8">
			<button
				type="button"
				onclick={capturePhoto}
				class="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 transition-transform active:scale-95"
				aria-label="Capturar foto"
			>
				<Circle class="h-10 w-10 fill-white text-white" />
			</button>
		</div>

		<canvas bind:this={canvasEl} class="hidden"></canvas>
	</div>
{/if}

<div class="flex flex-col items-center gap-3">
	<!-- Drop zone / avatar display -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class={clsx(
			'group relative cursor-pointer overflow-hidden border-2 transition-all duration-200',
			sizeMap[size],
			shapeMap[shape],
			isDragging
				? 'border-primary-500 bg-primary-50 scale-105'
				: displayUrl
					? 'border-transparent'
					: 'border-dashed border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/30'
		)}
		role="button"
		tabindex="0"
		onclick={() => galleryInput?.click()}
		onkeydown={(e) => e.key === 'Enter' && galleryInput?.click()}
		ondrop={onDrop}
		ondragover={onDragOver}
		ondragleave={onDragLeave}
		aria-label="Clique ou arraste uma imagem para alterar a foto"
	>
		{#if displayUrl}
			<img
				src={displayUrl}
				alt="Foto de perfil"
				class={clsx('h-full w-full object-cover', shapeMap[shape])}
			/>
		{:else}
			<div class="flex h-full w-full items-center justify-center">
				<span class={clsx('select-none', textSizeMap[size])}>{placeholder}</span>
			</div>
		{/if}

		<!-- Hover overlay -->
		<div
			class={clsx(
				'absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 transition-opacity',
				shapeMap[shape],
				isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
			)}
		>
			{#if isDragging}
				<Upload class="h-5 w-5 text-white" />
				<span class="text-xs font-medium text-white">Soltar aqui</span>
			{:else}
				<Camera class="h-5 w-5 text-white" />
				<span class="text-xs font-medium text-white">Alterar</span>
			{/if}
		</div>
	</div>

	<!-- Action buttons -->
	<div class="flex gap-2">
		<button
			type="button"
			onclick={() => galleryInput?.click()}
			class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
		>
			<ImagePlus class="h-3.5 w-3.5" />
			Galeria
		</button>
		<button
			type="button"
			onclick={openCamera}
			class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
		>
			<Camera class="h-3.5 w-3.5" />
			Câmera
		</button>
	</div>

	{#if cameraError}
		<p class="text-center text-xs text-red-500">{cameraError}</p>
	{:else}
		<p class="text-center text-xs text-gray-400">JPG, PNG ou WEBP · máx. 5 MB</p>
	{/if}

	<!-- Input para galeria (leva o arquivo no submit do form) -->
	<input
		bind:this={galleryInput}
		type="file"
		{name}
		accept="image/jpeg,image/png,image/webp"
		onchange={onGalleryChange}
		class="hidden"
		aria-hidden="true"
	/>

	<!-- Canvas oculto para captura da câmera -->
	{#if !cameraOpen}
		<canvas bind:this={canvasEl} class="hidden"></canvas>
	{/if}
</div>

<script lang="ts">
	import { clsx } from 'clsx';
	import { siteConfig } from '$lib/config/site.config';

	interface Props {
		children: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div
	class={clsx(
		'flex min-h-screen items-center justify-center',
		'bg-linear-to-br from-primary-50 to-secondary-50',
		'px-4 py-12',
	)}
>
	<div class="w-full max-w-md">
		<!-- Logo -->
		<div class="mb-8 text-center">
			<a
				href="/"
				class="font-display inline-flex items-center gap-2 text-2xl font-bold text-gray-900"
			>
				<span class="text-3xl">🐾</span>
				<span class="text-primary-600">{siteConfig.name}</span>
			</a>
		</div>

		<div class="rounded-2xl bg-white p-8 shadow-xl">
			{@render children()}
		</div>
	</div>
</div>

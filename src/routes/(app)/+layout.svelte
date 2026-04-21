<script lang="ts">
	import Navbar from "$lib/components/layout/Navbar.svelte";
	import Footer from "$lib/components/layout/Footer.svelte";
	import { authStore } from "$lib/stores/auth.store.svelte";
	import type { LayoutData } from "./$types";
	import type { Snippet } from "svelte";

	interface Props {
		data: LayoutData;
		children: Snippet;
	}

	let { data, children }: Props = $props();

	$effect(() => {
		authStore.setProfile(data.profile ?? null);
	});
</script>

<div class="flex min-h-screen flex-col">
	<Navbar />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer />
</div>

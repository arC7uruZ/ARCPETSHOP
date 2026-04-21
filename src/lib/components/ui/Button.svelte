<script lang="ts">
	import { tv } from "tailwind-variants";
	import Spinner from "./Spinner.svelte";

	const button = tv({
		base: [
			"inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none",
			"disabled:opacity-50"
		].join(" "),
		variants: {
			variant: {
				primary: [
					"bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700",
					"focus-visible:ring-primary-500 shadow-md hover:shadow-lg"
				].join(" "),
				secondary: [
					"bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700",
					"focus-visible:ring-secondary-500 shadow-md hover:shadow-lg"
				].join(" "),
				outline: [
					"border-2 border-primary-500 text-primary-600 hover:bg-primary-50 active:bg-primary-100",
					"focus-visible:ring-primary-500"
				].join(" "),
				ghost:
					"text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-gray-400",
				danger:
					"bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus-visible:ring-red-500",
				whatsapp: [
					"bg-green-500 text-white hover:bg-green-600 active:bg-green-700 focus-visible:ring-green-500",
					"shadow-md hover:shadow-lg"
				].join(" ")
			},
			size: {
				sm: "h-8 px-3 text-sm",
				md: "h-10 px-4 text-sm",
				lg: "h-12 px-6 text-base",
				xl: "h-14 px-8 text-lg"
			},
			fullWidth: {
				true: "w-full"
			}
		},
		defaultVariants: {
			variant: "primary",
			size: "md"
		}
	});

	interface Props {
		variant?:
			| "primary"
			| "secondary"
			| "outline"
			| "ghost"
			| "danger"
			| "whatsapp";
		size?: "sm" | "md" | "lg" | "xl";
		fullWidth?: boolean;
		loading?: boolean;
		disabled?: boolean;
		type?: "button" | "submit" | "reset";
		href?: string;
		class?: string;
		onclick?: (e: MouseEvent) => void;
		children?: import("svelte").Snippet;
	}

	let {
		variant = "primary",
		size = "md",
		fullWidth = false,
		loading = false,
		disabled = false,
		type = "button",
		href,
		class: className = "",
		onclick,
		children
	}: Props = $props();

	const classes = $derived(
		button({ variant, size, fullWidth, class: className })
	);
</script>

{#if href}
	<a {href} class={classes} aria-disabled={disabled}>
		{#if loading}
			<Spinner size="sm" />
		{/if}
		{@render children?.()}
	</a>
{:else}
	<button {type} class={classes} disabled={disabled || loading} {onclick}>
		{#if loading}
			<Spinner size="sm" />
		{/if}
		{@render children?.()}
	</button>
{/if}

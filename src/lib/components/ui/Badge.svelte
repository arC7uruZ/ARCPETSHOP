<script lang="ts">
	import { tv } from 'tailwind-variants';

	const badge = tv({
		base: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
		variants: {
			color: {
				gray: 'bg-gray-100 text-gray-700',
				yellow: 'bg-yellow-100 text-yellow-700',
				blue: 'bg-blue-100 text-blue-700',
				green: 'bg-green-100 text-green-700',
				red: 'bg-red-100 text-red-700',
				orange: 'bg-orange-100 text-orange-700',
				primary: 'bg-primary-100 text-primary-700'
			}
		},
		defaultVariants: { color: 'gray' }
	});

	interface Props {
		color?: 'gray' | 'yellow' | 'blue' | 'green' | 'red' | 'orange' | 'primary';
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { color = 'gray', class: className = '', children }: Props = $props();
</script>

<span class={badge({ color, class: className })}>
	{@render children?.()}
</span>

<script lang="ts">
	import { tv } from 'tailwind-variants';

	const card = tv({
		base: 'rounded-2xl bg-white',
		variants: {
			shadow: {
				none: '',
				sm: 'shadow-sm',
				md: 'shadow-md',
				lg: 'shadow-lg',
				xl: 'shadow-xl'
			},
			border: {
				true: 'border border-gray-200',
				false: ''
			},
			padding: {
				none: '',
				sm: 'p-4',
				md: 'p-6',
				lg: 'p-8'
			},
			hover: {
				true: 'transition-shadow duration-200 hover:shadow-xl cursor-pointer'
			}
		},
		defaultVariants: { shadow: 'md', border: false, padding: 'md' }
	});

	interface Props {
		shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
		border?: boolean;
		padding?: 'none' | 'sm' | 'md' | 'lg';
		hover?: boolean;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let {
		shadow = 'md',
		border = false,
		padding = 'md',
		hover = false,
		class: className = '',
		children
	}: Props = $props();
</script>

<div class={card({ shadow, border, padding, hover, class: className })}>
	{@render children?.()}
</div>

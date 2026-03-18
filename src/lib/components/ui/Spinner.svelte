<script lang="ts">
	import { tv } from 'tailwind-variants';

	const spinner = tv({
		base: 'animate-spin rounded-full border-2 border-current border-t-transparent',
		variants: {
			size: {
				sm: 'h-4 w-4',
				md: 'h-6 w-6',
				lg: 'h-8 w-8',
				xl: 'h-12 w-12'
			}
		},
		defaultVariants: { size: 'md' }
	});

	interface Props {
		size?: 'sm' | 'md' | 'lg' | 'xl';
		class?: string;
	}

	let { size = 'md', class: className = '' }: Props = $props();
</script>

<div class={spinner({ size, class: className })} role="status" aria-label="Carregando..."></div>

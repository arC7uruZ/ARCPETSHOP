<script lang="ts">
	import { clsx } from 'clsx';

	interface Props {
		id?: string;
		name?: string;
		type?: string;
		label?: string;
		placeholder?: string;
		value?: string;
		error?: string;
		required?: boolean;
		disabled?: boolean;
		step?: number | string;
		min?: number | string;
		max?: number | string;
		class?: string;
		onchange?: (e: Event) => void;
		oninput?: (e: Event) => void;
	}

	let {
		id,
		name,
		type = 'text',
		label,
		placeholder,
		value = $bindable(''),
		error,
		required = false,
		disabled = false,
		step,
		min,
		max,
		class: className = '',
		onchange,
		oninput
	}: Props = $props();

	const inputId = id ?? name ?? crypto.randomUUID();
</script>

<div class={clsx('w-full', className)}>
	{#if label}
		<label for={inputId} class="mb-1.5 block text-sm font-medium text-gray-700">
			{label}
			{#if required}<span class="ml-0.5 text-red-500">*</span>{/if}
		</label>
	{/if}

	<input
		id={inputId}
		{name}
		{type}
		{placeholder}
		{required}
		{disabled}
		{step}
		{min}
		{max}
		bind:value
		{onchange}
		{oninput}
		class={clsx(
			'block w-full',
			'rounded-xl border px-4 py-2.5 text-sm text-gray-900',
			'transition-colors focus:border-transparent focus:ring-2 focus:ring-primary-500 focus:outline-none',
			'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
			error
				? 'border-red-400 bg-red-50 focus:ring-red-400'
				: 'border-gray-300 bg-white hover:border-gray-400',
		)}
		aria-invalid={!!error}
		aria-describedby={error ? `${inputId}-error` : undefined}
	/>

	{#if error}
		<p id="{inputId}-error" class="mt-1.5 text-xs text-red-600">{error}</p>
	{/if}
</div>

<script lang="ts">
	import { clsx } from 'clsx';

	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		id?: string;
		name?: string;
		label?: string;
		options: Option[];
		value?: string;
		placeholder?: string;
		error?: string;
		required?: boolean;
		disabled?: boolean;
		class?: string;
		onchange?: (e: Event) => void;
	}

	let {
		id,
		name,
		label,
		options,
		value = $bindable(''),
		placeholder = 'Selecione...',
		error,
		required = false,
		disabled = false,
		class: className = '',
		onchange
	}: Props = $props();

	const selectId = id ?? name ?? crypto.randomUUID();
</script>

<div class={clsx('w-full', className)}>
	{#if label}
		<label for={selectId} class="mb-1.5 block text-sm font-medium text-gray-700">
			{label}
			{#if required}<span class="ml-0.5 text-red-500">*</span>{/if}
		</label>
	{/if}

	<select
		id={selectId}
		{name}
		{required}
		{disabled}
		bind:value
		{onchange}
		class={clsx(
			'block w-full',
			'rounded-xl border px-4 py-2.5 text-sm text-gray-900',
			'transition-colors focus:border-transparent focus:ring-2 focus:ring-primary-500 focus:outline-none',
			'disabled:cursor-not-allowed disabled:bg-gray-50',
			error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400',
		)}
		aria-invalid={!!error}
	>
		{#if placeholder}
			<option value="" disabled selected={!value}>{placeholder}</option>
		{/if}
		{#each options as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>

	{#if error}
		<p class="mt-1.5 text-xs text-red-600">{error}</p>
	{/if}
</div>

<script lang="ts">
	interface Props {
		id?: string;
		name?: string;
		label?: string;
		placeholder?: string;
		value?: string;
		rows?: number;
		error?: string;
		required?: boolean;
		disabled?: boolean;
		maxlength?: number;
		class?: string;
	}

	let {
		id,
		name,
		label,
		placeholder,
		value = $bindable(''),
		rows = 4,
		error,
		required = false,
		disabled = false,
		maxlength,
		class: className = ''
	}: Props = $props();

	const textareaId = id ?? name ?? crypto.randomUUID();
</script>

<div class="w-full {className}">
	{#if label}
		<label for={textareaId} class="mb-1.5 block text-sm font-medium text-gray-700">
			{label}
			{#if required}<span class="ml-0.5 text-red-500">*</span>{/if}
		</label>
	{/if}

	<textarea
		id={textareaId}
		{name}
		{rows}
		{placeholder}
		{required}
		{disabled}
		{maxlength}
		bind:value
		class="
			block w-full resize-none rounded-xl border px-4 py-2.5 text-sm text-gray-900 transition-colors
			focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
			disabled:cursor-not-allowed disabled:bg-gray-50
			{error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'}
		"
		aria-invalid={!!error}
	></textarea>

	<div class="mt-1 flex justify-between">
		{#if error}
			<p class="text-xs text-red-600">{error}</p>
		{:else}
			<span></span>
		{/if}
		{#if maxlength}
			<p class="text-xs text-gray-400">{value.length}/{maxlength}</p>
		{/if}
	</div>
</div>

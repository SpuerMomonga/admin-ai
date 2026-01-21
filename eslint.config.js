import antfu from '@antfu/eslint-config';

export default antfu({
	svelte: true,
	typescript: true,
	formatters: true,
	ignores: [
		'**/node_modules/**',
		'**/dist/**',
		'**/build/**',
		'**/coverage/**',
		'**/.svelte-kit/**',
		'**/.output/**',
		'**/.vercel/**',
		'**/.netlify/**'
	]
});

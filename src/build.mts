import { ensureDir } from 'https://deno.land/std@0.204.0/fs/ensure_dir.ts';
import { build, stop } from 'https://deno.land/x/esbuild@v0.19.4/mod.js';

interface EmojiData {
	name: string;
	hasSkinTones: boolean;
	glyph: string;
	group: string;
	keywords: string[];
	unicodes: string[];
	isAnimated?: true;
}

let components = (await Deno.readTextFile('./src/createComponent.txt')) + '\n\n';
let types = `import * as React from 'react'\n\n`;
const exports: string[] = [];

await ensureDir('cache');

const emojis: Record<string, EmojiData> = await (await fetch('https://raw.githubusercontent.com/malte9799/fluent-emoji/main/Emojis/metadata.json')).json();
delete emojis['not_found'];

Object.entries(emojis).forEach(([emoji_name, emoji_data]: [string, EmojiData]) => {
	const name = emoji_name
		.replace('1st', 'first')
		.replace('2nd', 'second')
		.replace('3rd', 'third')
		.split('_')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join('');

	types += `declare function ${name}(props: React.ImgHTMLAttributes<HTMLImageElement>): React.ReactElement\n`;
	components += `export const ${name} = createComponent('${emoji_name}', ${emoji_data.hasSkinTones})\n`;
	exports.push(name);
});

await Deno.writeTextFile('./cache/index.tsx', components);

await build({
	entryPoints: ['./cache/index.tsx'],
	allowOverwrite: true,
	format: 'esm',
	bundle: true,
	minify: true,
	target: 'es2020',
	external: ['react'],
	outfile: './index.js',
});

await Deno.writeTextFile('./index.d.ts', types + `\nexport { ${exports.join(', ')} }`);

await Deno.remove('./cache', { recursive: true });

stop();

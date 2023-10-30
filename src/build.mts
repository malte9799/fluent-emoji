import { ensureDir } from 'https://deno.land/std@0.204.0/fs/ensure_dir.ts';
import { build, stop } from 'https://deno.land/x/esbuild@v0.19.4/mod.js';

const imports: { [key: string]: any } = {};
for await (const file of Deno.readDir('./src/packages')) {
	const name = file.name.split('.')[0];
	const filePath = './packages/' + file.name;

	imports[name] = (await import(filePath)) as object;
}

const emojis: Record<string, EmojiData> = await (await fetch('https://raw.githubusercontent.com/malte9799/fluent-emoji/main/Emojis/metadata.json')).json();
delete emojis['not_found'];
const base_package = await Deno.readTextFile('./src/base_package.json');
const license = await Deno.readTextFile('./license');

Object.entries(emojis).forEach(([emoji_name, emoji_data]: [string, EmojiData]) => {
	const name = emoji_name
		.replace('1st', 'first')
		.replace('2nd', 'second')
		.replace('3rd', 'third')
		.split('_')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join('');

	for (const [_, module] of Object.entries(imports)) {
		module.register(name, emoji_name, emoji_data);
	}
});

async function generate_package(moduleName: string, module: any) {
	const module_path = './build/' + moduleName;
	let packageFile = base_package;
	packageFile = packageFile.replaceAll('{name}', module.config.name);
	packageFile = packageFile.replaceAll('{displayName}', module.config.displayName);
	packageFile = JSON.parse(packageFile);
	packageFile.peerDependencies = module.config.peerDependencies;

	await ensureDir(module_path);
	await ensureDir(module_path + '/cache');

	Deno.writeTextFile(module_path + '/package.json', JSON.stringify(packageFile, null, 2));
	Deno.writeTextFile(module_path + '/license', license);
	Deno.writeTextFile(module_path + '/index.d.ts', module.getTypes());

	await Deno.writeTextFile(module_path + '/cache/index.tsx', module.getComponents());

	await build({
		entryPoints: [module_path + '/cache/index.tsx'],
		allowOverwrite: true,
		format: 'esm',
		bundle: true,
		minify: true,
		target: 'es2020',
		external: module.config.external,
		outfile: module_path + '/index.js',
	});
}

const promises = [];
for (const [moduleName, module] of Object.entries(imports)) {
	promises.push(generate_package(moduleName, module));
}

Promise.all(promises).then(() => {
	stop();
});

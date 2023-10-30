import { ensureDir } from 'https://deno.land/std@0.204.0/fs/ensure_dir.ts';
import { build, stop } from 'https://deno.land/x/esbuild@v0.19.4/mod.js';

const baseDir = './src';

const packagesPath = `${baseDir}/packages`;
const imports: { [key: string]: ImportedObject } = {};
for await (const file of Deno.readDir(packagesPath)) {
	const name = file.name.split('.')[0];
	const filePath = `./packages/${file.name}`;
	imports[name] = await import(filePath);
}

const emojis: Record<string, EmojiData> = await (await fetch('https://raw.githubusercontent.com/malte9799/fluent-emoji/main/Emojis/metadata.json')).json();
delete emojis['not_found'];
const base_package = await Deno.readTextFile(`${baseDir}/base_package.json`);
const license = await Deno.readTextFile(`./license`);

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

const promises = [];
for (const [moduleName, module] of Object.entries(imports)) {
	promises.push(generate_package(moduleName, module));
}

Promise.all(promises).then(() => {
	stop();
});

async function generate_package(moduleName: string, module: ImportedObject) {
	const modulePath = `./build/${moduleName}`;
	let packageFile = base_package;
	packageFile = packageFile.replaceAll('{name}', module.config.name);

	packageFile = packageFile.replaceAll('{displayName}', module.config.displayName);
	const packageFileJSON = JSON.parse(packageFile);
	packageFileJSON.peerDependencies = module.config.peerDependencies;
	packageFile = JSON.stringify(packageFileJSON, null, 2);

	await ensureDir(modulePath);
	await ensureDir(`${modulePath}/cache`);

	Deno.writeTextFile(`${modulePath}/package.json`, packageFile);
	Deno.writeTextFile(`${modulePath}/license`, license);
	Deno.writeTextFile(`${modulePath}/index.d.ts`, module.getTypes());

	await Deno.writeTextFile(`${modulePath}/cache/index.tsx`, module.getComponents());

	await build({
		entryPoints: [`${modulePath}/cache/index.tsx`],
		allowOverwrite: true,
		format: 'esm',
		bundle: true,
		minify: true,
		target: 'es2020',
		external: module.config.external,
		outfile: `${modulePath}/index.js`,
	});
}

let types: string = `import * as React from 'react'\n\n`;
const types_exports: string[] = [];

let components: string = `
import React from 'react'
import Image from 'next/image'

const baseURL = 'https://raw.githubusercontent.com/malte9799/fluent-emoji/main/Emojis/';

function createComponent(name:string, hasSkinTones:boolean) {
  return ({ src, alt, type='3d', skin='default', ...rest }:{src:string, alt:string, type:string, skin:string}) => {
    let url = baseURL + name + '/' + type
    if (hasSkinTones) url += '/' + skin 
    url += type.match(/3d|animated/) ? '.png' : '.svg'
    return (
      <Image
        src={url}
        alt={alt || name}
        {...rest}
      />
    );
  }
}\n\n`;

export function register(name: string, emoji_name: string, emoji_data: EmojiData): void {
	types += `declare function ${name}(props: React.ImgHTMLAttributes<HTMLImageElement>): React.ReactElement\n`;
	types_exports.push(name);

	components += `export const ${name} = createComponent('${emoji_name}', ${emoji_data.hasSkinTones})\n`;
}
export function getTypes(): string {
	return `${types}\nexport { ${types_exports.join(', ')} }`;
}

export function getComponents(): string {
	return components;
}

export const config = {
	name: 'nextjs',
	displayName: 'Next.js',
	peerDependencies: {
		react: '^18',
		next: '^12',
	},

	external: ['react', 'next'],
};

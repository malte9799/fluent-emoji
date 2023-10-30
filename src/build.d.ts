declare interface EmojiData {
	name: string;
	hasSkinTones: boolean;
	glyph: string;
	group: string;
	keywords: string[];
	unicodes: string[];
	isAnimated?: true;
}
declare interface ImportedObject {
	register: (name: string, emoji_name: string, emoji_data: EmojiData) => void;
	getTypes: () => string;
	getComponents: () => string;
	config: {
		name: string;
		displayName: string;
		peerDependencies: {
			react: string;
		};
		external: string[];
	};
}

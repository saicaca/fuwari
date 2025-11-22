export type TSOptions = {
	quotes?: 'double' | 'single';
	comments?: Comment[];
};

interface Position {
	line: number;
	column: number;
}

// this exists in TSESTree but because of the inanity around enums
// it's easier to do this ourselves
export interface Comment {
	type: 'Line' | 'Block';
	value: string;
	start?: number;
	end?: number;
	loc: {
		start: Position;
		end: Position;
	};
}

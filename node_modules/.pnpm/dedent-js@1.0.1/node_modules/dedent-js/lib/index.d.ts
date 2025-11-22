declare module 'dedent-js' {
	interface Dedent {
		(templateStrings: TemplateStringsArray|string, ...values: any[]): string;
	}

	var dedent: Dedent;
	export = dedent;
}

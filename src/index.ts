import fs from 'fs';

interface Options {
	input: string;
	output: string;
	preserveConstEnums: boolean;
	preserveExports: boolean;
	preserveComments: boolean;
	preserveTSIgnore: boolean;
	verbose: boolean;
}

const options: Options = {
	input: '',
	output: '',
	preserveConstEnums: false,
	preserveExports: false,
	preserveComments: false,
	preserveTSIgnore: false,

	verbose: false
}

if (process.argv.length < 3) {
	console.log('Usage: mints [options]');
	console.log('Options:');
	console.log('--input <file> - The input file to transform');
	console.log('--output <file> - The output file to write the transformed code to');
	console.log('--preserveConstEnums - Preserve const enums');
	console.log('--preserveExports - Preserve exports');
	console.log('--preserveComments - Preserve comments');
	console.log('--preserveTSIgnore - Preserve @ts-ignore comments');
	console.log('--verbose - Enable verbose logging');
	process.exit(0);
}

// [what to change, does it have a value]
const argumentLookup: Record<string, [keyof typeof options, boolean?]> = {
	'--input': ['input', true],
	'--output': ['output', true],

	'--preserveConstEnums': ['preserveConstEnums'],
	'--preserveExports': ['preserveExports'],
	'--preserveComments': ['preserveComments'],
	'--preserveTSIgnore': ['preserveTSIgnore'],

	'--verbose': ['verbose'],
	'-v': ['verbose']
}

function Exit( reason: string, code: number = 1) : never {
	console.error(reason);
	process.exit(code);
}

function Log(message: string) {
	if (!options.verbose) return;
	console.log(message);
}

for (let i = 0; i < process.argv.length; i++) {
	const arg = process.argv[i] as string;
	const option = argumentLookup[arg]
	if (!option) continue;

	const [key, hasValue] = option;
	if (!hasValue) {
		// @ts-ignore
		options[key] = !options[key];
		continue;
	}

	const value = process.argv[i + 1];
	if (!value || value.startsWith('--')) {
		Exit(`Option ${arg} requires a value`);
	}

	// @ts-ignore
	options[key] = value;
}

// console.log(options);

// check the input/output are valid

if (!options.input) Exit('No input file specified');
if (!options.output) Exit('No output file specified');

if (options.input === options.output) Exit('Input and output files cannot be the same');

function ValidateFile(file: string, type: 'input' | 'output') {
	if (file.startsWith('--')) Exit(`No ${type} file specified`);
	if (!file.endsWith('.ts')) file += '.ts';
	
	if (type === 'output') {
		if (fs.existsSync(file)) Exit(`${type} file already exists`);
	}

	if (type === 'input') {
		if (!fs.existsSync(file)) Exit(`${type} file does not exist`);
		if (!fs.lstatSync(file).isFile()) Exit(`${type} file must be a file`);
	}
}

ValidateFile(options.input, 'input');
ValidateFile(options.output, 'output');

Log(`Reading input file ${options.input}`);

const inputContent = fs.readFileSync(options.input, 'utf-8');
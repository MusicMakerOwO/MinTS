interface Generic<T> {
	value: T;
}

const generic: Generic<string> = {
	value: 'Hello, World!'
};

export const a = 1;
export default { generic }

function Add(a: number, b: number): number {
  return a + b;
}

// Adds two numbers together
const sum = Add(1, 2) as number;
console.log(sum);
# Examples

## Vitest

```typescript
import { describe, it, expect } from 'vitest';

describe( 'Vitest Example', () => {
	it( 'will execute a glsl unit test', () => {
		const test = glslTest( {
			fragmentShader: `
				vec4 runTest( vec4 inputData ) {
					return vec4( 1.0 ) + inputData;
				}
			`,
			inputBuffer: new Float32Array( [ 0, 1, 2, 3 ] ),
		} );

		// Render the input buffer through the shader pipeline
		test.run();

		// Read the output
		const result: Float32Array = test.readPixels();

		// Perform a deep equality check to ensure the input buffer data
		// has had `1` added to each of the RGBA components.
		expect( result ).to.deep.equal( new Float32Array( [ 1, 2, 3, 4 ] ) );
	} );
} );
```

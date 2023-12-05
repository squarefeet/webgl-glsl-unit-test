# Examples

## Vitest - Basic

```js
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
		const result = test.readPixels();

		// Perform a deep equality check to ensure the input buffer data
		// has had `1` added to each of the RGBA components.
		expect( result ).to.deep.equal( new Float32Array( [ 1, 2, 3, 4 ] ) );
	} );
} );
```


## Vitest - Raw Shader

If you need more control over the test, you can take (almost) full control and specify your own ShaderMaterial, DataTexture, etc.

```js
import { glslTestRaw } from 'webgl-glsl-unit-test';
import { Vector2, DataTexture, ShaderMaterial } from 'three';

describe( 'Vitest Complex Example', () => {
	it( 'will execute a basic test', () => {
		const material = new ShaderMaterial( {
			uniforms: {
				tInput: { value: null },
			},
			vertexShader: passThroughVertexShader,
			fragmentShader: `
				#define resolution vec2( 1.0, 1.0 )
				uniform sampler2D tInput;

				vec4 runTest( vec4 inputData ) {
					return vec4( 1.0 ) + inputData;
				}

				void main() {
					vec2 uv = gl_FragCoord.xy / resolution.xy;
					vec4 tInputData = texture2D( tInput, uv );
					gl_FragColor = runTest( tInputData );
				}
			`,
		} );

		const size = new Vector2( 1, 1 );
		const inputBuffer = new Float32Array( [ 0, 1, 2, 3 ] );
		const dataTexture = new DataTexture(
			inputBuffer,
			size.x,
			size.y,
			RGBAFormat,
			FloatType,
		);

		// Don't forget this step!
		dataTexture.needsUpdate = true;

		const test = glslTestRaw( {
			inputBuffer,
			dataTexture,
			size,
			material,
		} );

		test.run();

		expect( test.readPixels() )
			.to
			.deep
			.equal( new Float32Array( [ 1, 2, 3, 4 ] ) );
	} );
} );
```

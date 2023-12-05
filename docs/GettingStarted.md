# Getting Started

## Installation

#### Install the package:

> `npm install --save-dev webgl-glsl-unit-test`

> `yarn add -D webgl-glsl-unit-test`


#### Install dependencies

This package uses Three.js under the hood to extract away the WebGL-based heavy lifting so you'll need to add that dependency too.

> `npm install --save-dev three`

> `yarn add -D three`


## Post Installation

Using your test runner of choice, import the `glslTest` method:

> `import { glslTest } from 'webgl-glsl-unit-test';`

Within a test, create a `glslTest`:

```js
	// The GLSL code to test must be within a function
	// called `runTest` with the following signature:
	//   `vec4 runTest( vec4 inputData ) { ... }`
	//
	// You can make it as complex as you want, but you
	// must always have the `runTest` method defined
	// in your GLSL code.
	//
	// The result of your test must always be returned from
	// the `runTest` method, as under the hood, this happens:
	//   `gl_FragColor = runTest( inputData );`
	const shaderTestCode = `
		vec4 runTest( vec4 inputData ) {
			return vec4( 1.0 ) + inputData;
		}
	`;

	const test = glslTest( {
		fragmentShader: shaderTestCode,

		// `inputBuffer`s can be any TypedArray, whether
		// that's a Float32Array, Uint8Array, etc.
		inputBuffer: new Float32Array( [ 0, 1, 2, 3 ] ),
	} );

	// Render the input buffer through the shader pipeline
	test.run();

	// Read the rendered pixels
	// The output will always be the same TypedArray as your
	// input buffer. It will also be truncated (if required)
	// to the same length
	const result = test.readPixels();
```

You can then use your test runner of choice to assert against the `result` constant.




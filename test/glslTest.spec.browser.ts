import { describe, it, expect } from "vitest";
import { glslTest } from "../src/main";
import { Vector4 } from "three";

describe( 'glslTest', () => {
	describe( 'glslTest()', () => {
		it( 'will execute a basic test', () => {
			const shaderUnit = `
				vec4 runTest( vec4 inputData ) {
					return vec4( 1.0 ) + inputData;
				}
			`;

			const test = glslTest( {
				fragmentShader: shaderUnit,
				inputBuffer: new Float32Array( [ 0, 1, 2, 3 ] ),
			} );

			test.run();

			expect( test.readPixels() ).to.deep.equal( new Float32Array( [ 1, 2, 3, 4 ] ) );
		} );

		it( 'will allow uniforms to be used', () => {
			const shaderUnit = `
				vec4 runTest( vec4 inputData ) {
					return vec4( testUniform ) + inputData;
				}
			`;

			const test = glslTest( {
				uniforms: {
					testUniform: { value: 10.0 },
				},
				fragmentShader: shaderUnit,
				inputBuffer: new Float32Array( [ 0, 1, 2, 3 ] ),
			} );

			test.run();

			expect( test.readPixels() ).to.deep.equal( new Float32Array( [ 10, 11, 12, 13 ] ) );
		} );

		it( 'will allow defines to be used', () => {
			const shaderUnit = `
				vec4 runTest( vec4 inputData ) {
					return vec4( testDefine ) + inputData;
				}
			`;

			const test = glslTest( {
				defines: {
					testDefine: 'ivec4( 1, 2, 3, 4 )',
				},
				fragmentShader: shaderUnit,
				inputBuffer: new Float32Array( [ 0, 1, 2, 3 ] ),
			} );

			test.run();

			expect( test.readPixels() ).to.deep.equal( new Float32Array( [ 1, 3, 5, 7 ] ) );
		} );

		it( 'will have cumulative effects if run more than once', () => {
			const shaderUnit = `
				vec4 runTest( vec4 inputData ) {
					return vec4( 1.0 ) + inputData;
				}
			`;

			const test = glslTest( {
				fragmentShader: shaderUnit,
				inputBuffer: new Float32Array( [ 0, 1, 2, 3 ] ),
			} );

			test.run();
			test.run();

			expect( test.readPixels() ).to.deep.equal( new Float32Array( [ 2, 3, 4, 5 ] ) );
		} );

		it( 'will allow uniforms to be changed between runs', () => {
			const shaderUnit = `
				vec4 runTest( vec4 inputData ) {
					return testUniform + inputData;
				}
			`;

			const test = glslTest( {
				uniforms: {
					testUniform: { value: 1.0 },
				},
				fragmentShader: shaderUnit,
				inputBuffer: new Float32Array( [ 0, 1, 2, 3 ] ),
			} );

			test.run(); // Output buffer will now be [ 1, 2, 3, 4 ]
			test.uniforms.testUniform.value = 10.0;
			test.run(); // Output buffer should now increase by 10;

			expect( test.readPixels() ).to.deep.equal( new Float32Array( [ 11, 12, 13, 14 ] ) );
		} );

		it( 'will allow a reset between runs', () => {
			const shaderUnit = `
				vec4 runTest( vec4 inputData ) {
					return vec4( 1.0 ) + inputData;
				}
			`;

			const test = glslTest( {
				fragmentShader: shaderUnit,
				inputBuffer: new Float32Array( [ 0, 1, 2, 3 ] ),
			} );

			test.run(); // Output buffer will now be [ 1, 2, 3, 4 ]
			test.reset();
			test.run(); // Output buffer should be [ 1, 2, 3, 4 ] again.

			expect( test.readPixels() ).to.deep.equal( new Float32Array( [ 1, 2, 3, 4 ] ) );
		} );

		it( 'will compute large datasets', () => {
			const shaderUnit = `
				vec4 runTest( vec4 inputData ) {
					return testUniform + inputData;
				}
			`;

			const test = glslTest( {
				uniforms: {
					testUniform: { value: 1.0 },
				},
				fragmentShader: shaderUnit,
				inputBuffer: new Float32Array( 1000 * 4 ).fill( 0 ),
			} );

			test.run(); // Output buffer will now be [ 1, 2, 3, 4 ]
			test.uniforms.testUniform.value = 10.0;
			test.run(); // Output buffer should now increase by 10;

			expect( test.readPixels() ).to.deep.equal( new Float32Array( 1000 * 4 ).fill( 11 ) );
		} );

		it( 'will execute a slightly more complex test', () => {
			const shaderUnit = `
				vec4 runTest( vec4 inputData ) {
					return inputData + uVelocity * uTime;
				}
			`;

			const test = glslTest( {
				uniforms: {
					uTime: { value: 1 },
					uVelocity: { value: new Vector4( 0, 1, 0, 0 ) },
				},
				fragmentShader: shaderUnit,
				inputBuffer: new Float32Array( [
					0, 0, 0, 0,
					0, 10, 0, 0,
				] ),
			} );

			let runningTotal = 0;

			for( let i = 0; i < 5; ++i ) {
				test.uniforms.uTime.value = i;
				test.run();
				runningTotal += 1 * test.uniforms.uTime.value;
			}

			expect( test.readPixels() ).to.deep.equal( new Float32Array( [
				0, runningTotal, 0, 0,
				0, runningTotal * 2, 0, 0,
			] ) );
		} );
	} );
} );

import { describe, it, expect } from "vitest";
import { glslTestRaw } from "../src/main";
import { DataTexture, FloatType, RGBAFormat, ShaderMaterial, Vector2 } from "three";
import passThroughVertexShader from '../src/shaders/pass-through-vertex.glsl?raw';

describe( 'glslTest', () => {
	describe( 'glslTestRaw()', () => {
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

			const inputBuffer = new Float32Array( [ 0, 1, 2, 3 ] );
			const dataTexture = new DataTexture(
				inputBuffer,
				1, 1,
				RGBAFormat,
				FloatType,
			);

			dataTexture.needsUpdate = true;

			const test = glslTestRaw( {
				inputBuffer,
				dataTexture,
				size: new Vector2( 1, 1 ),
				material,
			} );

			test.run();

			expect( test.readPixels() ).to.deep.equal( new Float32Array( [ 1, 2, 3, 4 ] ) );
		} );
	} );
} );

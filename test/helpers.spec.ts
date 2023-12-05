import { describe, expect, it } from 'vitest';
import { DataTexture, Matrix3, Matrix4, Vector2, Vector3, Vector4 } from 'three';
import {
	getDefineStrings,
	getUniformStrings,
	getUniformType,
	processShader,
} from '../src/helpers';

describe( 'Helpers', () => {
	describe( 'getUniformType()', () => {
		const types = [
			{ value: 1.0, expected: 'float' },
			{ value: new Vector2(), expected: 'vec2' },
			{ value: new Vector3(), expected: 'vec3' },
			{ value: new Vector4(), expected: 'vec4' },
			{ value: new Matrix3(), expected: 'mat3' },
			{ value: new Matrix4(), expected: 'mat4' },
			{ value: new DataTexture( new Float32Array( 2 ), 1, 1 ), expected: 'sampler2D' },
			{ value: [ 1.0, 2.0 ], expected: 'float[2]' },
			{ name: 'Vector2[]', value: [ new Vector2(), new Vector2() ], expected: 'vec2[2]' },
			{ name: 'Vector3[]', value: [ new Vector3(), new Vector3() ], expected: 'vec3[2]' },
			{ name: 'Vector4[]', value: [ new Vector4(), new Vector4() ], expected: 'vec4[2]' },
			{ name: 'Matrix3[]', value: [ new Matrix3(), new Matrix3() ], expected: 'mat3[2]' },
			{ name: 'Matrix4[]', value: [ new Matrix4(), new Matrix4() ], expected: 'mat4[2]' },
			{
				name: 'Texture[]',
				value: [
					new DataTexture( new Float32Array( 2 ), 1, 1 ),
					new DataTexture( new Float32Array( 2 ), 1, 1 ),
					new DataTexture( new Float32Array( 2 ), 1, 1 ),
				],
				expected: 'sampler2DArray',
			},
		]

		types.forEach( type => {
			it( `will output ${type.expected} for ${type.name || type.value.constructor.name}`, () => {
				expect( getUniformType( type.value ) ).to.equal( type.expected );
			} );
		} );
	} );


	describe( 'getDefineStrings()', () => {
		it( 'will transform a single define into a string', () => {
			const defines = {
				resolution: 'vec2(10.0, 15.0)',
			};

			expect( getDefineStrings( defines ) ).to.equal(
				'#define resolution vec2(10.0, 15.0)'
			);
		} );

		it( 'will transform multiple defines into a string', () => {
			const defines = {
				resolution: 'vec2(10.0, 15.0)',
				testDefine1: 10,
				testDefine2: -1,
			};

			expect( getDefineStrings( defines ) ).to.equal( [
				'#define resolution vec2(10.0, 15.0)',
				'#define testDefine1 10',
				'#define testDefine2 -1',
			].join( '\n' ) );
		} );

		it( 'will transform defines with undefined or null values into a string', () => {
			const defines = {
				flag1: undefined,
				flag2: null,
				flag3: false,
			};

			expect( getDefineStrings( defines ) ).to.equal( [
				'#define flag1',
				'#define flag2',
				'#define flag3 false',
			].join( '\n' ) );
		} );
	} );

	describe( 'getUniformStrings()', () => {
		it( 'will transform a single uniform into a string', () => {
			const uniforms = {
				tInput: {
					value: new DataTexture( new Float32Array( 2 ), 1, 1 ),
				},
			};

			expect( getUniformStrings( uniforms ) ).to.equal(
				'uniform sampler2D tInput;'
			);
		} );

		it( 'will transform multiple uniforms into a string', () => {
			const uniforms = {
				tInput: { value: new DataTexture( new Float32Array( 2 ), 1, 1 ) },
				testFloat: { value: 1.0 },
				testVector2: { value: new Vector2() },
			};

			expect( getUniformStrings( uniforms ) ).to.equal( [
				'uniform sampler2D tInput;',
				'uniform float testFloat;',
				'uniform vec2 testVector2;',
			].join( '\n' ) );
		} );
	} );

	describe( 'processShader()', () => {
		it( 'will place given shader test code into fragment shader template', () => {
			const shader = `vec4 runTest() { return vec4(0.0); }`;

			expect( processShader( shader, {}, {} ) ).to.equal( [
				shader,
				'',
				'void main() {',
				'	vec2 uv = gl_FragCoord.xy / resolution.xy;',
				'	vec4 tInputData = texture2D( tInput, uv );',
				'	gl_FragColor = runTest( tInputData );',
				'}',
			].join( '\n' ) );
		} );

		it( 'will place uniforms into fragment shader template', () => {
			const uniforms = {
				tInput: {
					value: new DataTexture( new Float32Array( 2 ), 1, 1 ),
				},
				customUniform: {
					value: 10,
				},
			};

			expect( processShader( '', {}, uniforms ) ).to.equal( [
				'uniform sampler2D tInput;',
				'uniform float customUniform;',
				'',
				'',
				'void main() {',
				'	vec2 uv = gl_FragCoord.xy / resolution.xy;',
				'	vec4 tInputData = texture2D( tInput, uv );',
				'	gl_FragColor = runTest( tInputData );',
				'}',
			].join( '\n' ) );
		} );

		it( 'will place defines into fragment shader template', () => {
			const defines = {
				resolution: 'vec2( 0.0, 0.0 )',
				flag: true,
			};

			expect( processShader( '', defines, {} ) ).to.equal( [
				'#define resolution vec2( 0.0, 0.0 )',
				'#define flag true',
				'',
				'',
				'',
				'void main() {',
				'	vec2 uv = gl_FragCoord.xy / resolution.xy;',
				'	vec4 tInputData = texture2D( tInput, uv );',
				'	gl_FragColor = runTest( tInputData );',
				'}',
			].join( '\n' ) );
		} );

		it( 'will place shader, defines, and uniforms into fragment shader template', () => {
			const shader = `vec4 runTest() { return vec4(0.0); }`;

			const defines = {
				resolution: 'vec2( 0.0, 0.0 )',
				flag: true,
			};

			const uniforms = {
				tInput: {
					value: new DataTexture( new Float32Array( 2 ), 1, 1 ),
				},
				customUniform: {
					value: 10,
				},
			};

			expect( processShader( shader, defines, uniforms ) ).to.equal( [
				'#define resolution vec2( 0.0, 0.0 )',
				'#define flag true',
				'uniform sampler2D tInput;',
				'uniform float customUniform;',
				shader,
				'',
				'void main() {',
				'	vec2 uv = gl_FragCoord.xy / resolution.xy;',
				'	vec4 tInputData = texture2D( tInput, uv );',
				'	gl_FragColor = runTest( tInputData );',
				'}',
			].join( '\n' ) );
		} );
	} );
} );

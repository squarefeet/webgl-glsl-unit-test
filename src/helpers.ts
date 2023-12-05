import {
    ClampToEdgeWrapping,
    DataTexture,
    FloatType,
    Matrix3,
    Matrix4,
    NearestFilter,
    RGBAFormat,
    Texture,
    TypedArray,
    Vector2,
    Vector3,
    Vector4,
    WebGLRenderTarget,
} from "three";
import testFragmentShaderTemplate from './shaders/test-fragment-template.glsl?raw';
import type { GLSLTestDefines, GLSLTestUniforms } from './types';

export function getTextureSize( inputBuffer: TypedArray ): Vector2 {
	if( inputBuffer.length >= 100 ) {
		const size = Math.max(
            2,
            Math.ceil( Math.sqrt( inputBuffer.length / 4 ) )
        );

		return new Vector2( size, size );
	}

    return new Vector2( Math.ceil( inputBuffer.length / 4 ), 1 );
}

export function createDataTexture( inputBuffer: TypedArray, size: Vector2 ): DataTexture {
    const texture = new DataTexture(
		inputBuffer,
		size.x,
		size.y,
		RGBAFormat,
		FloatType,
	);

	texture.needsUpdate = true;

	return texture;
}

export function createRenderTarget( size: Vector2 ): WebGLRenderTarget {
    return new WebGLRenderTarget( size.x, size.y, {
		wrapS      : ClampToEdgeWrapping,
		wrapT      : ClampToEdgeWrapping,
		minFilter  : NearestFilter,
		magFilter  : NearestFilter,
		format     : RGBAFormat,
		type       : FloatType,
		depthBuffer: false,
	} )
}

export function getDefineStrings( defines: GLSLTestDefines ): string {
	return Object.entries( defines )
		.map( ( [ key, value ] ) => {
			return `#define ${key} ${value ?? ''}`.trim();
		} )
		.join( '\n' );
}

export function getUniformType( uniformValue: unknown ): string {
	if( Array.isArray( uniformValue ) ) {
		const type = getUniformType( uniformValue[ 0 ] );

		if( type === 'sampler2D' ) {
			return 'sampler2DArray';
		}

		return `${type}[${uniformValue.length}]`;
	}

	if( uniformValue?.constructor === Number ) {
		return 'float';
	}

	if( uniformValue instanceof Vector2 ) {
		return 'vec2';
	}

	if( uniformValue instanceof Vector3 ) {
		return 'vec3';
	}

	if( uniformValue instanceof Vector4 ) {
		return 'vec4';
	}

	if( uniformValue instanceof Matrix3 ) {
		return 'mat3';
	}

	if( uniformValue instanceof Matrix4 ) {
		return 'mat4';
	}

	if( uniformValue instanceof Texture ) {
		return 'sampler2D';
	}

	return 'UNKNOWN';
}

export function getUniformStrings( uniforms: GLSLTestUniforms ): string {
	return Object.entries( uniforms )
		.map( ( [ key, uniform ] ) => {
			const type = getUniformType( uniform?.value ?? '' );
			return `uniform ${type} ${key};`.trim();
		} )
		.join( '\n' );
}

export function processShader( shader: string, defines: GLSLTestDefines, uniforms: GLSLTestUniforms ): string {
	const definesString = getDefineStrings( defines );
	const uniformsString = getUniformStrings( uniforms );

    return testFragmentShaderTemplate
		.replace( '#include<glsl_test_defines>', definesString )
		.replace( '#include<glsl_test_uniforms>', uniformsString )
		.replace( '#include<glsl_test_source>', shader )
		.trim();
}

// From: three/src/animation/AnimationUtils.js
//
// Copied into this codebase just in case the original gets
// moved about or deleted.
export function isTypedArray( object: unknown ): boolean {
	return ArrayBuffer.isView( object ) && !( object instanceof DataView );
}

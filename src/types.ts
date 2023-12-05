import type { IUniform, TypedArray, DataTexture, ShaderMaterial, Vector2 } from "three";

export type GLSLTestDefines = Record<string, unknown>;
export type GLSLTestUniforms = Record<string, IUniform>;

export interface GLSLTestConfig {
	defines?: GLSLTestDefines;
	uniforms?: GLSLTestUniforms;
	vertexShader?: string;
	fragmentShader: string;
	inputBuffer: TypedArray,
	outputBuffer?: TypedArray,
}

export interface GLSLTestRawConfig {
	material: ShaderMaterial;
	dataTexture: DataTexture;
	inputBuffer: TypedArray;
	size: Vector2;
}

export type TypedArrayConstructor =
	| Int8ArrayConstructor
	| Uint8ArrayConstructor
	| Uint8ClampedArrayConstructor
	| Int16ArrayConstructor
	| Uint16ArrayConstructor
	| Int32ArrayConstructor
	| Uint32ArrayConstructor
	| Float32ArrayConstructor
	| Float64ArrayConstructor;

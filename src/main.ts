import { GLSLTest } from './GLSLTest';
import type { GLSLTestConfig, GLSLTestRawConfig } from './types';

export function glslTestRaw( config: GLSLTestRawConfig ): GLSLTest {
	return new GLSLTest(
		config.inputBuffer,
		undefined,
		undefined,
		undefined,
		config.size,
		config.dataTexture,
		config.material,
	);
}

export function glslTest( config: GLSLTestConfig ): GLSLTest {
	return new GLSLTest(
		config.inputBuffer,
		config.uniforms ?? {},
		config.defines ?? {},
		config.fragmentShader
	);
}

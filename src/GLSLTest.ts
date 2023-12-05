import {
	Camera,
	DataTexture,
	Mesh,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	TypedArray,
	Vector2,
	WebGLRenderTarget,
	WebGLRenderer,
} from "three";
import passThroughVertexShader from './shaders/pass-through-vertex.glsl?raw';
import passThroughFragmentShader from './shaders/pass-through-fragment.glsl?raw';
import { createDataTexture, createRenderTarget, getTextureSize, processShader } from "./helpers";
import type { GLSLTestDefines, GLSLTestUniforms, TypedArrayConstructor } from "./types";

const PASS_THRU_MATERIAL = new ShaderMaterial( {
	uniforms: {
		tInput: { value: null },
	},
	defines: {
		resolution: '',
	},
	vertexShader: passThroughVertexShader,
	fragmentShader: passThroughFragmentShader,
} );

export class GLSLTest {
	private renderTargets: WebGLRenderTarget[] = [];
	private scene: Scene = new Scene();
	private camera: Camera = new Camera();
	private renderer: WebGLRenderer = new WebGLRenderer();
	private mesh: Mesh = new Mesh( new PlaneGeometry( 2, 2 ) );
	private renderTargetReadIndex: number = 0;
	private renderTargetWriteIndex: number = 1;

	public inputBuffer: TypedArray;
	public outputBuffer: TypedArray;
	public textureSize: Vector2 = new Vector2();
	public dataTexture: DataTexture;
	public defines: GLSLTestDefines = {};
	public uniforms: GLSLTestUniforms = {
		tInput: { value: null },
	};
	public material: ShaderMaterial;

	constructor(
		inputBuffer: TypedArray,
		uniforms: GLSLTestUniforms = {},
		defines: GLSLTestDefines = {},
		fragmentShader: string = '',
		textureSize: Vector2 = getTextureSize( inputBuffer ),
		dataTexture: DataTexture = createDataTexture( inputBuffer, textureSize ),
		material?: ShaderMaterial,
	) {
		this.scene.add( this.mesh );
		this.camera.position.z = 1;

		this.inputBuffer = inputBuffer;
		this.textureSize = textureSize;
		this.dataTexture = dataTexture;
		this.outputBuffer = new ( this.inputBuffer.constructor as TypedArrayConstructor )(
			this.textureSize.x * this.textureSize.y * 4
		);

		this.uniforms.tInput.value = this.dataTexture;

		this.defines = {
			resolution: `vec2( ${this.textureSize.x}, ${this.textureSize.y} )`,
			...defines,
			...material?.defines ?? {}
		};

		this.uniforms = {
			...this.uniforms,
			...uniforms,
			...material?.uniforms ?? {}
		};

		this.material = material || this.createShaderMaterial( fragmentShader );

		this.renderInputBuffer();
	}

	private createShaderMaterial( fragmentShader: string ): ShaderMaterial {
		return new ShaderMaterial( {
			defines: this.defines,
			uniforms: this.uniforms,
			vertexShader: passThroughVertexShader,
			fragmentShader: processShader( fragmentShader, this.defines, this.uniforms ),
		} );
	}

	private resetRenderTargets() {
		while( this.renderTargets.length > 0 ) {
			this.renderTargets.pop();
		}
	}

	private resetScene(): void {
		this.scene = new Scene();
		this.scene.add( this.mesh );
	}

	private resetCamera(): void {
		this.camera.position.set( 0, 0, 1 );
	}

	private getCurrentReadRenderTarget(): WebGLRenderTarget {
		return this.renderTargets[ this.renderTargetReadIndex ];
	}

	private getCurrentWriteRenderTarget(): WebGLRenderTarget {
		return this.renderTargets[ this.renderTargetWriteIndex ];
	}

	private flipRenderTargets(): void {
		this.renderTargetReadIndex = Number( !this.renderTargetReadIndex );
		this.renderTargetWriteIndex = Number( !this.renderTargetWriteIndex );
	}

	private renderInputBuffer(): void {
		PASS_THRU_MATERIAL.uniforms.tInput.value = this.dataTexture;
		PASS_THRU_MATERIAL.defines.resolution = `vec2( ${this.textureSize.x}, ${this.textureSize.y} )`;

		this.renderTargets[ 0 ] = createRenderTarget( this.textureSize );
		this.renderTargets[ 1 ] = createRenderTarget( this.textureSize );

		this.mesh.material = PASS_THRU_MATERIAL;

		this.render();
	}

	private render() {
		// Setup the renderer to render to the current write render target
		this.renderer!.setRenderTarget( this.getCurrentWriteRenderTarget() );

		// Render the scene
		this.renderer!.render( this.scene, this.camera );

		// Ping ping render targets
		this.flipRenderTargets();
	}

	public reset() {
		this.resetRenderTargets();
		this.resetScene();
		this.resetCamera();
		this.renderInputBuffer();
	}

	public run(): void {
		this.mesh.material = this.material;
		this.material.uniforms.tInput.value = this.getCurrentReadRenderTarget().texture;
		this.render();
	}

	public readPixels(
		size: Vector2 = this.textureSize,
		offset: Vector2 = new Vector2( 0, 0 )
	): TypedArray {
		this.renderer.readRenderTargetPixels(
			this.getCurrentReadRenderTarget(),
			offset.x,
			offset.y,
			size.x,
			size.y,
			this.outputBuffer
		);

		return this.outputBuffer.slice( 0, this.inputBuffer.length );
	}
}

#include<glsl_test_defines>
#include<glsl_test_uniforms>
#include<glsl_test_source>

void main() {
	vec2 uv = gl_FragCoord.xy / resolution.xy;
	vec4 tInputData = texture2D( tInput, uv );
	gl_FragColor = runTest( tInputData );
}

uniform sampler2D tInput;

void main() {
	vec2 uv = gl_FragCoord.xy / resolution.xy;
	gl_FragColor = texture2D( tInput, uv );
}

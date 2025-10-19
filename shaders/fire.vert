// fire.vert
precision mediump float;

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform float timeFactor;

varying vec2 vTextureCoord;

float rand(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    vec3 pos = aVertexPosition;

    // Generate pseudo-random factor based on position
    float randomness = rand(pos.xy);

    // Curve the flame vertices upward with oscillation
    float wave = sin(timeFactor * 0.2 + pos.y * 3.0 + randomness * 6.28);
    
    // Displace left/right and slightly forward/backward to give volume
    float displacement = 0.5 * wave * randomness;
    pos.x += displacement;
    pos.z += displacement * 2.0; // modify this last value to make fire dance

    gl_Position = uPMatrix * uMVMatrix * vec4(pos, 1.0);
    vTextureCoord = aTextureCoord;
}

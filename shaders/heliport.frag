// shaders/heliport.frag
precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uTexture1; // heliport base
uniform sampler2D uTexture2; // heliport up/down
uniform float mixFactor;     // interpolação entre 0 e 1

void main() {
    vec4 tex1 = texture2D(uTexture1, vTextureCoord);
    vec4 tex2 = texture2D(uTexture2, vTextureCoord);
    gl_FragColor = mix(tex1, tex2, mixFactor);
}

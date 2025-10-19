import { CGFobject } from '../../lib/CGF.js';

/**
 * MySphere
 * Creates a 3D sphere using parametric equations with customizable resolution.
 * @constructor
 * @param scene - Reference to the scene
 * @param slices - Number of horizontal divisions (like longitude)
 * @param stacks - Number of vertical divisions (like latitude)
 */
export class MySphere extends CGFobject {
    constructor(scene, slices, stacks) {
        super(scene);
        this.slices = slices || 16; // Horizontal divisions (around Y axis)
        this.stacks = stacks || 8;  // Vertical divisions (from top to bottom)
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = []; // Vertex coordinates
        this.normals = []; // Normals for lighting
        this.texCoords = []; // Texture coordinates
        this.indices = []; // Triangles using vertex indices

        // Angular steps between slices and stacks
        var deltaAlpha = Math.PI / this.stacks;  // Vertical angle step
        var deltaBeta = 2 * Math.PI / this.slices; // Horizontal angle step

        // === Generate vertices, normals, and texture coordinates ===
        for (var i = 0; i <= this.stacks; i++) {
            var alpha = i * deltaAlpha; // Current vertical angle
            var sinAlpha = Math.sin(alpha);
            var cosAlpha = Math.cos(alpha);

            for (var j = 0; j <= this.slices; j++) {
                var beta = j * deltaBeta; // Current horizontal angle
                var sinBeta = Math.sin(beta);
                var cosBeta = Math.cos(beta);

                // Spherical to Cartesian coordinates
                var x = sinAlpha * cosBeta;
                var y = cosAlpha;
                var z = sinAlpha * sinBeta;

                this.vertices.push(x, y, z); // Add the vertex
                this.normals.push(x, y, z);  // Normal is same as the position vector (for unit sphere)
                this.texCoords.push(1-j / this.slices, i / this.stacks); // Texture coordinates (u, v) mapped from (j, i)
            }
        }

        // === Generate indices to form triangles between stacks and slices ===
        for (var i = 0; i < this.stacks; i++) {
            for (var j = 0; j < this.slices; j++) {
                var first = i * (this.slices + 1) + j; // top-left corner
                var second = first + this.slices + 1; // bottom-left
                
                // Triangle 1 (top-left, bottom-left, top-right)
                this.indices.push(first, second, first + 1);

                // Triangle 2 (bottom-left, bottom-right, top-right)
                this.indices.push(second, second + 1, first + 1);
            }
        }

        // Set primitive type and initialize buffers in WebGL
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}



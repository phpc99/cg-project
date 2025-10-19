import { CGFobject } from '../../lib/CGF.js';

/**
 * MyFire
 * Represents a single triangular flame (like a 2D fire shape) rendered as a triangle.
 */
export class MyFire extends CGFobject {
    constructor(scene, height = 4, base = 1.5) {
        super(scene);
        this.height = height; // Height of the flame
        this.base = base; // Half of the base width of the triangle

        this.initBuffers();  // Initialize geometry buffers
    }

    /**
     * Initializes the geometry of the fire shape using a simple triangle.
     */
    initBuffers() {
        // Define vertices of the triangle (a single upward flame)
        this.vertices = [
            0, this.height, 0, // Top point (apex of the flame)
            -this.base, 0, this.base, // Bottom-left base corner
            this.base, 0, this.base // Bottom-right base corner
        ];

        // Define one triangle using indices of the vertices
        this.indices = [0, 1, 2];
        // All normals pointing forward (Z+), since it's a flat triangle
        this.normals = [0, 0, 1, 0, 0, 1, 0, 0, 1]; // Front
        this.texCoords = [0.5, 0, 0, 1, 1, 1]; // Texture coordinates (for optional flame texture)

        this.primitiveType = this.scene.gl.TRIANGLES; // Rendering as triangle
        this.initGLBuffers(); // Upload data to GPU

    }
}

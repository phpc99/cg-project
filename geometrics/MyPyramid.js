import { CGFobject } from '../../lib/CGF.js';

/**
 * MyPyramid
 * Creates a 3D pyramid with a polygonal base (default is square).
 * The pyramid consists of triangular side faces and a filled base.
 */
export class MyPyramid extends CGFobject {
    constructor(scene, baseSize, height, slices = 4) {
        super(scene);
        this.baseSize = baseSize; // Radius of the base (controls the size)
        this.height = height; // Height of the pyramid
        this.slices = slices; // Number of sides of the base polygon (4 = square)
        this.initBuffers(); // Initialize geometry
    }

    initBuffers() {
        this.vertices = []; // Stores 3D vertex positions
        this.indices = []; // Defines triangles via vertex indices
        this.normals = []; // Normal vectors for lighting
        this.texCoords = []; // Texture coordinates

        const angleStep = 2 * Math.PI / this.slices; // Angle between each base vertex

        // === 1. Add the apex of the pyramid ===
        this.vertices.push(0, this.height, 0); // Top point (apex)
        this.normals.push(0, 1, 0); // Approximate normal (upwards)
        this.texCoords.push(0.5, 0); // Texture coordinate at the top

        // === 2. Add base vertices around a circle (XZ plane) ===
        for (let i = 0; i <= this.slices; i++) {
            const angle = i * angleStep;
            const x = this.baseSize * Math.cos(angle);
            const z = this.baseSize * Math.sin(angle);
            this.vertices.push(x, 0, z); // Base vertex
            this.normals.push(0, -1, 0); // Base normal pointing down
            this.texCoords.push(0.5 + 0.5 * Math.cos(angle), 0.5 + 0.5 * Math.sin(angle)); // Circular texture mapping
        }

        // === 3. Side Faces: Create triangles from apex to base edges ===
        for (let i = 1; i <= this.slices; i++) {
            this.indices.push(0, i, i + 1); // Triangle from apex to two base vertices
        }

        // === 4. Base Center Vertex ===
        const baseStart = this.vertices.length / 3; // Starting index for base center
        this.vertices.push(0, 0, 0); // Center of the base
        this.normals.push(0, -1, 0); // Normal pointing down
        this.texCoords.push(0.5, 0.5); // Center texture coordinate

        // === 5. Add base vertices again for base triangulation ===
        for (let i = 0; i <= this.slices; i++) {
            const angle = i * angleStep;
            const x = this.baseSize * Math.cos(angle);
            const z = this.baseSize * Math.sin(angle);
            this.vertices.push(x, 0, z);
            this.normals.push(0, -1, 0);
            this.texCoords.push(0.5 + 0.5 * Math.cos(angle), 0.5 + 0.5 * Math.sin(angle));
        }

        // === 6. Base Faces: Triangles connecting center to surrounding base points ===
        for (let i = 1; i <= this.slices; i++) {
            this.indices.push(baseStart, baseStart + i + 1, baseStart + i);
        }

        // === Final Setup ===
        this.primitiveType = this.scene.gl.TRIANGLES; // Use triangles
        this.initGLBuffers(); // Send buffers to the GPU
    }
}

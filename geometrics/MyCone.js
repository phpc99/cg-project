import { CGFobject } from '../../lib/CGF.js';

// Class representing a 3D cone object
export class MyCone extends CGFobject {
    constructor(scene, baseRadius, height, slices) {
        super(scene);
        this.baseRadius = baseRadius;
        this.height = height;
        this.slices = slices;
        this.initBuffers(); // Initialize geometry buffers
    }

    initBuffers() {
        this.vertices = []; // Vertex positions
        this.indices = []; // Triangle indices
        this.normals = []; // Vertex normals
        this.texCoords = []; // Texture coordinates

        const angleStep = 2 * Math.PI / this.slices;

        // Add center vertex for the base (used in base triangles)
        this.vertices.push(0, 0, 0); // Position at origin (base center)
        this.normals.push(0, -1, 0); // Normal pointing downward
        this.texCoords.push(0.5, 0.5); // Center of texture
        const baseCenterIndex = 0;

        // Generate vertices around the base circle
        for (let i = 0; i <= this.slices; i++) {
            const angle = i * angleStep;
            const x = this.baseRadius * Math.cos(angle);
            const z = this.baseRadius * Math.sin(angle);

            this.vertices.push(x, 0, z); // Vertex on the base circumference
            this.normals.push(0, -1, 0); // Normal pointing downward
            this.texCoords.push(0.5 + 0.5 * Math.cos(angle), 0.5 + 0.5 * Math.sin(angle)); // Map circular texture coordinates
        }

        // Define triangle indices for the base (fan around the center)
        for (let i = 1; i <= this.slices; i++) {
            this.indices.push(baseCenterIndex, i + 1, i);
        }

        // Store the starting index for side vertices
        const sideStartIndex = this.vertices.length / 3;

        // Generate vertices and normals for the cone's side surface
        for (let i = 0; i <= this.slices; i++) {
            const angle = i * angleStep;
            const x = this.baseRadius * Math.cos(angle);
            const z = this.baseRadius * Math.sin(angle);

            // Bottom vertex on the base circumference
            this.vertices.push(x, 0, z);
            
            // Approximate normal for the side
            const nx = x;
            const ny = this.baseRadius / this.height; // Controls the slope of the cone
            const nz = z;
            const len = Math.sqrt(nx * nx + ny * ny + nz * nz); // Normalize
            this.normals.push(nx / len, ny / len, nz / len);
            this.texCoords.push(i / this.slices, 1); // Texture coordinate at base

            // Apex vertex (top of the cone)
            this.vertices.push(0, this.height, 0);
            this.normals.push(nx / len, ny / len, nz / len);
            this.texCoords.push(i / this.slices, 0); // Texture coordinate at top
        }

        // Create side surface triangles using generated vertices
        for (let i = 0; i < this.slices * 2; i += 2) {
            this.indices.push(sideStartIndex + i, sideStartIndex + i + 1, sideStartIndex + i + 2);
        }

        // Set the primitive type to triangles and initialize WebGL buffers
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}

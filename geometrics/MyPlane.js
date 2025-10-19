import {CGFobject} from '../../lib/CGF.js';

/**
 * MyPlane
 * Represents a 2D plane composed of triangles using a triangle strip.
 * Supports adjustable resolution and texture coordinates.
 *
 * @constructor
 * @param scene - Reference to the MyScene object
 * @param nrDivs - Number of divisions (subdivisions) along both axes
 * @param minS - Minimum S texture coordinate
 * @param maxS - Maximum S texture coordinate
 * @param minT - Minimum T texture coordinate
 * @param maxT - Maximum T texture coordinate
 */
export class MyPlane extends CGFobject {
	constructor(scene, nrDivs, minS, maxS, minT, maxT) {
		super(scene);
		
		// Set number of divisions, default to 1 if undefined
		nrDivs = typeof nrDivs !== 'undefined' ? nrDivs : 1;
		this.nrDivs = nrDivs;
		
		// Length of each patch cell
		this.patchLength = 1.0 / nrDivs;

		// Texture coordinates range
		this.minS = minS || 0;
		this.maxS = maxS || 1;
		this.minT = minT || 0;
		this.maxT = maxT || 1;

		// Increments for texture coordinates per division
		this.q = (this.maxS - this.minS) / this.nrDivs;
		this.w = (this.maxT - this.minT) / this.nrDivs;
		this.initBuffers(); // Initialize geometry
	} 

	initBuffers() {
		// Arrays to hold vertex data
		this.vertices = [];
		this.normals = [];
		this.texCoords = [];
		var yCoord = 0.5;

		// Create vertices, normals, and texture coordinates
		for (var j = 0; j <= this.nrDivs; j++) {
			var xCoord = -0.5;
			for (var i = 0; i <= this.nrDivs; i++) {

				// Position of vertex
				this.vertices.push(xCoord, yCoord, 0);

				// Normal pointing out of the screen (z direction)
				this.normals.push(0, 0, 1);

				// Texture coordinates interpolated
				this.texCoords.push(this.minS + i * this.q, this.minT + j * this.w);
				xCoord += this.patchLength; // Move to the next vertex in x
			}
			yCoord -= this.patchLength; // Move one row down in y
		}
		
		// Indices for rendering the mesh using triangle strips
		this.indices = [];

		var ind = 0;
		for (var j = 0; j < this.nrDivs; j++) {
			for (var i = 0; i <= this.nrDivs; i++) {
				// Create two rows per column for triangle strip
				this.indices.push(ind);
				this.indices.push(ind + this.nrDivs + 1);
				ind++;
			}
			// Add degenerate triangles (duplicated vertices) to connect strips
			if (j + 1 < this.nrDivs) {
				this.indices.push(ind + this.nrDivs);
				this.indices.push(ind);
			}
		}

		// Use triangle strips as the default primitive
		this.primitiveType = this.scene.gl.TRIANGLE_STRIP;

		// Send data to GPU
		this.initGLBuffers();
	}

	// Set rendering mode to fill (triangles)
	setFillMode() { 
		this.primitiveType=this.scene.gl.TRIANGLE_STRIP;
	}

	// Set rendering mode to wireframe (lines)
	setLineMode() 
	{ 
		this.primitiveType=this.scene.gl.LINES;
	};

}



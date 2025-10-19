import {CGFobject, CGFappearance, CGFtexture} from '../../lib/CGF.js';
import { MyPlane } from './../geometrics/MyPlane.js';

/**
 * MyField
 * Represents a textured ground field using a repeated grass texture on a large plane.
 */
export class MyField extends CGFobject {

    constructor(scene) {
        super(scene)

        // Create a large plane with UV coordinates stretching from 0 to 24 (for texture repetition)
        this.plane = new MyPlane(this.scene, 1, 0, 24, 0, 24);

        // Setup material with grass texture
        this.planeMaterial = new CGFappearance(this.scene);
        this.planeMaterial.setSpecular(0, 0, 0, 1); // No specular reflection (non-shiny)
        this.planeMaterial.setEmission(0.3, 0.3, 0.3, 1); // Adds subtle brightness to make it visible
        this.planeMaterial.setTexture(new CGFtexture(this.scene, "./images/grass-seamless.jpeg"));
        this.planeMaterial.setTextureWrap('REPEAT', 'REPEAT'); // Repeat texture over the large surface
    }

    /**
     * Displays the field by scaling a textured plane to cover a large ground area.
     */
    display() {
        this.scene.pushMatrix();

        // Position and orient the field correctly
        this.scene.translate(0, 0, 0);
        this.scene.scale(400, 400, 400); // Large ground size
        this.scene.rotate(-Math.PI / 2, 1, 0, 0); // Rotate to lie flat on the XZ plane
        this.planeMaterial.apply(); // Apply material and render the plane
        this.plane.display();
        this.scene.popMatrix()
    }
}

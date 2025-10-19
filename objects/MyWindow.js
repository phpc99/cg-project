import { CGFobject, CGFappearance, CGFtexture } from '../../lib/CGF.js';
import { MyPlane } from './../geometrics/MyPlane.js';

/**
 * MyWindow
 * Represents a textured window using a single 2D plane (quad).
 */
export class MyWindow extends CGFobject {
    constructor(scene, texturePath) {
        super(scene);
        // Create the plane geometry that will serve as the window surface
        this.windowPlane = new MyPlane(scene, 1); // Single quad
        // Create the material (appearance) for the window
        this.windowAppearance = new CGFappearance(scene);
        // Load the texture for the window from the given path
        this.texture = new CGFtexture(scene, texturePath);
        // Apply the texture to the appearance
        this.windowAppearance.setTexture(this.texture);
    }
    /**
     * Display the window by applying its material and rendering the quad.
     */
    display() {
        this.windowAppearance.apply(); // Apply the texture and material settings
        this.windowPlane.display(); // Render the textured quad
    }
}

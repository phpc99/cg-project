import { CGFobject, CGFappearance } from '../../lib/CGF.js';
import { MySphere } from './../geometrics/MySphere.js';

/**
 * MyPanorama
 * This class renders a panoramic background using a large inverted sphere
 * and a sky-like texture. It creates an immersive environment surrounding the scene.
 */
export class MyPanorama extends CGFobject {

    constructor(scene, texture) {
        super(scene);
        // Create a high-resolution sphere (used as the sky dome)
        this.sphere = new MySphere(this.scene, 40, 40); // 40 slices and 40 stacks
        // Set up the appearance with a panoramic texture
        this.material = new CGFappearance(this.scene);
        this.material.setEmission(1, 1, 1, 1); // Makes it self-illuminated (not affected by lights)
        this.material.setTexture(texture); // Apply the provided texture (e.g., sky image)
    }

    display() {
        this.scene.pushMatrix();
        this.material.apply(); // Apply the panorama material

        // If panorama is set to follow the camera (infinite backdrop), translate it
        if (this.scene.infinitePanorama)
            this.scene.translate(
                this.scene.camera.position[0],
                this.scene.camera.position[1],
                this.scene.camera.position[2]
            );

        // Scale the sphere to make it large enough to surround the entire scene
        // The negative Z scale flips the sphere inside out, so texture is visible from inside
        this.scene.scale(200, 200, -200); 
        // Render the sphere as the background
        this.sphere.display();
        this.scene.popMatrix();
    }
}

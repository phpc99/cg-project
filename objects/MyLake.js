import { CGFobject, CGFappearance, CGFtexture } from '../../lib/CGF.js';
import { MyPlane } from './../geometrics/MyPlane.js';

/**
 * MyLake
 * Represents a water lake in the scene using a textured plane.
 */
export class MyLake extends CGFobject {
    constructor(scene) {
        super(scene);
        // Create a large plane for the lake
        this.plane = new MyPlane(scene, 1);
        // Material (appearance) setup for the lake
        this.lakeAppearance = new CGFappearance(scene);
        this.lakeAppearance.setAmbient(1, 1, 1, 1);
        this.lakeAppearance.setDiffuse(1, 1, 1, 1);
        this.lakeAppearance.setSpecular(1, 1, 1, 1);
        // Load lake texture (should have transparency)
        this.lakeAppearance.setTexture(new CGFtexture(scene, "./images/lake.png"));
        this.lakeAppearance.setTextureWrap('CLAMP_TO_EDGE', 'CLAMP_TO_EDGE');
    }

    display() {
        this.scene.pushMatrix();

        // Enable blending to support transparency in the lake texture
        this.scene.gl.enable(this.scene.gl.BLEND);
        this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE_MINUS_SRC_ALPHA);
        // Position the lake in the world (shifted left and back)
        this.scene.translate(-50, 0.02, 50);
        // Scale the lake to make it larger (multiplier controls the area)
        let mult = 3;
        this.scene.scale(20 * mult, 1, 20 * mult);
        // Rotate the plane to lie flat on the XZ plane
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        // Apply material and draw the lake
        this.lakeAppearance.apply();
        this.plane.display();

        // Disable blending to avoid affecting other objects in the scene
        this.scene.gl.disable(this.scene.gl.BLEND);

        this.scene.popMatrix();
    }
}

import { CGFobject, CGFappearance, CGFtexture } from '../../lib/CGF.js';
import { MyCone } from './../geometrics/MyCone.js';       // Import cone class
import { MyPyramid } from './../geometrics/MyPyramid.js'; // Reusable for crown layers

/**
 * MyTree
 * This class renders a stylized tree composed of a textured trunk and layered pyramids as the crown.
 * The tree can also be slightly tilted to add natural randomness.
 */
export class MyTree extends CGFobject {
    constructor(
        scene, 
        tiltAngle,  // Tilt angle in degrees
        tiltAxis, // Axis of tilt: 'X' or 'Z'
        trunkRadius, // Radius of the trunk
        treeHeight, // Total height of the tree
        crownColor, // Color of the foliage (RGB array)
        trunkTex, // Texture for the trunk
        crownTex // Texture for the crown
    ) {
        super(scene);

        // Convert angle from degrees to radians
        this.tiltAngle = tiltAngle * Math.PI / 180;
        this.tiltAxis = tiltAxis.toUpperCase();

        // Basic tree geometry
        this.trunkRadius = trunkRadius;
        this.treeHeight = treeHeight;
        this.crownColor = crownColor;

        // Define trunk and crown height ratios
        this.trunkHeight = treeHeight * 0.5;
        this.crownHeight = treeHeight * 0.8;

        // Number of crown layers (pyramids), at least 2
        this.numCrownLayers = Math.max(2, Math.floor(this.crownHeight / 2));

        // Create the trunk cone
        this.trunk = new MyCone(scene, trunkRadius, this.trunkHeight, 20);

        // Create the layered pyramids for the crown (gradually smaller)
        this.crownLayers = [];
        for (let i = 0; i < this.numCrownLayers; i++) {
            this.crownLayers.push( // decreasing base size
                new MyPyramid(scene, trunkRadius * (3 - i * 0.7), this.crownHeight / this.numCrownLayers, 7)
            );
        }

        // Appearance for trunk with texture
        this.trunkAppearance = new CGFappearance(this.scene);
        this.trunkAppearance.setTexture(trunkTex);
        // Appearance for crown with texture and color
        this.crownAppearance = new CGFappearance(this.scene);
        this.crownAppearance.setTexture(crownTex);
        this.crownAppearance.setAmbient(...crownColor, 1.0);
        this.crownAppearance.setDiffuse(...crownColor, 1.0);
        this.crownAppearance.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.crownAppearance.setShininess(5);
    }

    display() {
        this.scene.pushMatrix();

        // Apply tilt transformation (either around X or Z axis)
        if (this.tiltAxis === 'X') this.scene.rotate(this.tiltAngle, 1, 0, 0);
        else if (this.tiltAxis === 'Z') this.scene.rotate(this.tiltAngle, 0, 0, 1);

        // Draw the tree trunk
        this.trunkAppearance.apply();
        this.scene.pushMatrix();
        this.trunk.display();
        this.scene.popMatrix();

        // Draw each crown layer (stacked vertically with some spacing)
        this.crownAppearance.apply();
        for (let i = 0; i < this.numCrownLayers; i++) {
            // Calculate Y offset for each layer
            const heightOffset = 0.3 * this.trunkHeight + i * (this.crownHeight / this.numCrownLayers) - 0.8*i;
            this.scene.pushMatrix();
            this.scene.translate(0, heightOffset, 0);
            this.crownLayers[i].display();
            this.scene.popMatrix();
        }

        this.scene.popMatrix();
    }
}

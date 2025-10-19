import { CGFobject, CGFappearance, CGFtexture, CGFshader } from '../../lib/CGF.js';
import { MyPlane } from './../geometrics/MyPlane.js';
import { MyWindow } from './MyWindow.js';

/**
 * MyBuilding
 * A modular building class composed of three segments (left, center, right),
 * including features such as windows, door, sign, and heliport with shader effects.
 */
export class MyBuilding extends CGFobject {
    constructor(scene, width, floors, windowsPerFloor, windowTexturePath, buildingColor) {
        super(scene);

        // Basic parameters
        this.width = width;
        this.floors = floors;
        this.windowsPerFloor = windowsPerFloor; // modify this to change the number of windows
        this.window = new MyWindow(scene, windowTexturePath);

        // Building color/material setup
        this.color = new CGFappearance(scene);
        this.color.setAmbient(...buildingColor);
        this.color.setDiffuse(...buildingColor);
        this.color.setSpecular(0.1, 0.1, 0.1, 1.0);
        this.color.setShininess(5);

        // Dimensions
        this.floorHeight = 5;                       // aka building height
        this.depth = width / 3;                     // building width
        this.sideWidth = width / 5;                 // side width
        this.centerWidth = this.sideWidth * 1.5; 
        this.centralFloors = floors + 1;            // nr of floors in central module

        // Planes and objects
        this.quad = new MyPlane(scene, 1);

        // Door texture setup
        this.door = new MyPlane(scene, 1);
        this.doorAppearance = new CGFappearance(scene);
        this.doorAppearance.setTexture(new CGFtexture(scene, "./images/door.png"));

        // Sign setup
        this.sign = new MyPlane(scene, 1);
        this.signTexture = new CGFappearance(scene);
        this.signTexture.setTexture(new CGFtexture(scene, "./images/bombeiros_sign.png"));

        // Heliport textures and base
        this.heliportCircle = new MyPlane(scene, 30);
        this.hTexture = new CGFappearance(scene);
        this.hTexture.setTexture(new CGFtexture(scene, "./images/heliport.png"));

        this.hTextureUp = new CGFappearance(scene);
        this.hTextureUp.setTexture(new CGFtexture(scene, "./images/heliport_up.png"));

        this.hTextureDown = new CGFappearance(scene);
        this.hTextureDown.setTexture(new CGFtexture(scene, "./images/heliport_down.png"));

        // Optional blinking lights at heliport corners
        this.cornerLights = [];
        for (let i = 0; i < 4; i++) {
            this.cornerLights.push(new MyPlane(scene, 1)); // could be changed to MyCube for a 3D effect
        }

        // Textures for shader blending
        this.hBase = new CGFtexture(scene, "./images/heliport.png");
        this.hUp = new CGFtexture(scene, "./images/heliport_up.png");
        this.hDown = new CGFtexture(scene, "./images/heliport_down.png");

        // Custom shader to blend heliport textures dynamically
        this.heliShader = new CGFshader(scene.gl, "shaders/heliport.vert", "shaders/heliport.frag");
        this.heliShader.setUniformsValues({ mixFactor: 0.0 });
        this.heliShader.setUniformsValues({ uTexture1: 0, uTexture2: 1 }); // tex units

    }

    /**
     * drawBox
     * Renders one vertical module of the building (left, center, or right)
     */
    drawBox(x, floors, width, isCentral = false) {
        const h = this.floorHeight;
        const height = h * floors;
        const d = this.depth;

        
        this.scene.pushMatrix();
        this.scene.translate(x, height / 2, 0);

        // ===== Walls =====
        this.color.apply();

        // Front wall
        this.scene.pushMatrix();
        this.scene.translate(0, 0, d / 2);
        this.scene.scale(width, height, 1);
        this.quad.display();
        this.scene.popMatrix();

        // Back wall 
        this.scene.pushMatrix();
        this.scene.translate(0, 0, -d / 2);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.scene.scale(width, height, 1);
        this.quad.display();
        this.scene.popMatrix();

        // Left wall
        this.scene.pushMatrix();
        this.scene.translate(-width / 2, 0, 0);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.scale(d, height, 1);
        this.quad.display();
        this.scene.popMatrix();

        // Right wall
        this.scene.pushMatrix();
        this.scene.translate(width / 2, 0, 0);
        this.scene.rotate(-Math.PI / 2, 0, 1, 0);
        this.scene.scale(d, height, 1);
        this.quad.display();
        this.scene.popMatrix();

        // Bottom (floor)
        this.scene.pushMatrix();
        this.scene.translate(0, -height / 2, 0);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(width, d, 1);
        this.quad.display();
        this.scene.popMatrix();

        // Top (roof)
        this.scene.pushMatrix();
        this.scene.translate(0, height / 2, 0);
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.scene.scale(width, d, 1);
        this.quad.display();
        this.scene.popMatrix();

        this.scene.popMatrix();

        // ===== Door and Sign (only center) =====
        if (isCentral) {
            // Door
            this.scene.pushMatrix();
            this.scene.translate(x, h / 2.5, d / 2 + 0.01);
            this.scene.scale(3, 4, 1);      // Door size
            this.doorAppearance.apply();
            this.door.display();
            this.scene.popMatrix();

            // Sign
            this.scene.pushMatrix();
            this.scene.translate(x, h, d / 2 + 0.01);
            this.scene.scale(4, 1.2, 1);  // Size
            this.signTexture.apply();
            this.sign.display();
            this.scene.popMatrix();
        }

        // ===== Windows =====
        for (let floor = 0; floor < floors; floor++) {
            if (isCentral && floor === 0) continue; // no windows on center ground floor
            for (let w = 0; w < this.windowsPerFloor; w++) {
                let wx = x - width / 2 + (w + 1) * (width / (this.windowsPerFloor + 1));
                let wy = floor * h + h / 2;
                this.scene.pushMatrix();
                this.scene.translate(wx, wy, d / 2 + 0.02);
                this.scene.scale(1.5, 1.5, 1);      // Window size
                this.window.display();
                this.scene.popMatrix();
            }
        }

        

        // === HELIPORT TEXTURE SELECTION ===

        if (isCentral) {
            const time = this.currentTime || 0;

            
            const heli = this.scene?.heli;
            const state = heli?.state || 'idle';

          
            let mixFactor = 0.0;
            let tex2 = this.hBase;

            if (state === 'ascending') {
                mixFactor = Math.min((time % 1000) / 1000, 1.0);
                tex2 = this.hUp;
            } else if (state === 'descending') {
                mixFactor = Math.min((time % 1000) / 1000, 1.0);
                tex2 = this.hDown;
            }

            
            this.scene.pushMatrix();
            this.scene.translate(x, h * floors + 0.1, 0);
            this.scene.rotate(-Math.PI / 2, 1, 0, 0);
            this.scene.scale(8, 8, 1);

            // Apply shader and bind both textures
            this.scene.setActiveShader(this.heliShader);
            this.heliShader.setUniformsValues({ mixFactor: mixFactor });

            this.scene.gl.activeTexture(this.scene.gl.TEXTURE0);
            this.hBase.bind(0);

            this.scene.gl.activeTexture(this.scene.gl.TEXTURE1);
            tex2.bind(1);


            this.heliportCircle.display();

            this.scene.setActiveShader(this.scene.defaultShader);
            this.scene.popMatrix();
        }

        // ==== Blinking Corner Lights ====
        if (isCentral && (this.scene.heli.state === 'ascending' || this.scene.heli.state === 'descending')) {
            const pulse = 0.5 + 0.5 * Math.sin(this.currentTime / 200);
        
            const emissiveMat = new CGFappearance(this.scene);
            emissiveMat.setEmission(pulse, pulse, 0, 1); // blinking yellow
            emissiveMat.setDiffuse(0, 0, 0, 1);
            emissiveMat.setAmbient(0, 0, 0, 1);
            emissiveMat.setSpecular(0, 0, 0, 1);
            emissiveMat.apply();
        
            const offset = 4.5; 
        
            const positions = [
                [-offset, 0, -offset],
                [-offset, 0, offset],
                [offset, 0, -offset],
                [offset, 0, offset],
            ];
        
            for (let i = 0; i < 4; i++) {
                const [x, y, z] = positions[i];
                this.scene.pushMatrix();
                this.scene.translate(x, this.floorHeight * floors + 0.2, z);
                this.scene.scale(0.5, 0.1, 0.5); 
                this.cornerLights[i].display();
                this.scene.popMatrix();
            }
        }
        

    }

    /**
     * Updates time-based animations (e.g., heliport blinking, shader transitions)
     */
    update(t) {
        this.currentTime = t;
    }
    
    /**
     * Main render function for the full building
     * Includes left, center, and right segments
     */
    display() {
        const h = this.floorHeight; // Left side
        const SW = this.sideWidth; // Center
        const CW = this.centerWidth; // Right side
    
        // Left module (shifted left by half center + half side width)
        this.drawBox(-(CW / 2 + SW / 2), this.floors, SW, false);
    
        // Center module (at origin)
        this.drawBox(0, this.centralFloors, CW, true);
    
        // Right module (shifted right by half center + half side width)
        this.drawBox(CW / 2 + SW / 2, this.floors, SW, false);
    }
}

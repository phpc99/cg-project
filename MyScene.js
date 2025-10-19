import { CGFscene, CGFcamera, CGFaxis, CGFappearance, CGFtexture, CGFshader } from "../lib/CGF.js";
import { MyField } from "./objects/MyField.js"; // Import Field
import { MyPanorama } from "./objects/MyPanorama.js"; // Import Panorama
import { MyBuilding } from "./objects/MyBuilding.js"; // Import Building
import { MyForest } from "./objects/MyForest.js";     // Import Forest
import { MyHeli } from './objects/MyHeli.js';
import { MyLake } from './objects/MyLake.js';
import { MyFire } from './objects/MyFire.js';

/**
 * MyScene
 * @constructor
 */
export class MyScene extends CGFscene {
  constructor() {
    super();
  }

  init(application) {

    // Initialization
    super.init(application);
    this.initCameras();
    this.initLights();

    // Background color
    this.gl.clearColor(0, 0, 0, 1.0);
    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.enableTextures(true);
    this.setUpdatePeriod(50);

    // Fire shader
    this.fireShader = new CGFshader(this.gl, "shaders/fire.vert", "shaders/fire.frag");
    this.fireShader.setUniformsValues({ timeFactor: 0 });
    // Fire texture
    this.fireTexture = new CGFtexture(this, "./images/fire.png");

    // Initialize Scene Objects
    this.axis = new CGFaxis(this, 5, 0.3);
    this.field = new MyField(this);
    this.building = new MyBuilding(this, 30, 3, 2, "./images/window.png", [0.8, 0.1, 0.1, 1.0]);  // Building: width 30, 3 floors (side), 2 windows per floor, color red
    this.forest = new MyForest(this, 6, 5, "./images/bark.jpg", "./images/leaves.jpg", 20, 20);   // Change the last two arguments to move the forest around the field

    // Load panorama texture and create MyPanorama instance
    this.panoramaTexture = new CGFtexture(this, "./images/panorama.jpg");
    this.panorama = new MyPanorama(this, this.panoramaTexture);
    this.heli = new MyHeli(this); 
    // Objects connected to MyInterface
    this.displayField = true;
    this.displayPanorama = true;
    this.infinitePanorama = true; // Swtich between true and false to see changes
    this.scaleFactor = 1;
    this.displayBuilding = true;
    this.displayForest = true;

    this.speedFactor = 1; 

    this.lake = new MyLake(this);
    this.fires = [
      new MyFire(this, 3.2, 1.2),
      new MyFire(this, 4.2, 2.3),
      new MyFire(this, 3.9, 1.9),
      new MyFire(this, 3.7, 1.5),
      new MyFire(this, 4.2, 2.0),
      new MyFire(this, 3.9, 1.4),
      new MyFire(this, 5.0, 2.3),
      new MyFire(this, 2.8, 1.1),
      new MyFire(this, 4.4, 1.6)
    ];
  
    
    this.firePositions = [
      { x: 22, z: 22 },
      { x: 23.5, z: 23.5 },
      { x: 24, z: 21.5 },
      { x: 23, z: 20 },
      { x: 22.5, z: 19 },
      { x: 25, z: 22 },
      { x: 21.8, z: 23 },
      { x: 24.2, z: 20.5 },
      { x: 23.3, z: 24 }
    ];  
  }

  initLights() {
    this.lights[0].setPosition(200, 200, 200, 1);
    this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.lights[0].enable();
    this.lights[0].update();
  }

  initCameras() {
    this.camera = new CGFcamera(
      1.0,                              // Field of view - FOV
      0.1,                              // Near clipping plane
      1000,                             // Far clipping plane
      vec3.fromValues(-50, 60, 70),   // Camera position (eye)
      vec3.fromValues(0, 0, 0)          // Camera target (center)
    );
  }

  checkKeys() {
    this.heli.movingForward = false;
    this.heli.movingBackward = false;

    if (this.gui.isKeyPressed("KeyW")) {
        this.heli.accelerate(-this.speedFactor);
    }

    if (this.gui.isKeyPressed("KeyS")) {
        this.heli.accelerate(this.speedFactor);
    }

    if (this.gui.isKeyPressed("KeyA")) {
        this.heli.turn(-this.speedFactor);
    }

    if (this.gui.isKeyPressed("KeyD")) {
        this.heli.turn(+this.speedFactor);
    }

    if (this.gui.isKeyPressed("KeyP")) {
        this.heli.liftOff();
    }

    if (this.gui.isKeyPressed("KeyL")) {
        this.heli.land();
        this.heli.pickupWater(); // 
    }

    if (this.gui.isKeyPressed("KeyR")) {
        this.heli.reset();
    }

    if (this.gui.isKeyPressed("KeyO")) {
        this.heli.releaseWater(); // 
    }
  }

  extinguishFiresNear(x, z) {
    for (let i = 0; i < this.fires.length; i++) {
        const fire = this.fires[i];
        const { x: fx, z: fz } = this.firePositions[i];
        const dx = fx - x;
        const dz = fz - z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < 6) {
            this.fires.splice(i, 1);
            this.firePositions.splice(i, 1);
            i--;
        }
    }
  }



  update(t) {
    this.checkKeys();
    this.heli.update(t);
    this.building.update(t);

    this.fireShader.setUniformsValues({ timeFactor: t / 100 % 100 });
  }

  setDefaultAppearance() {
    this.setAmbient(0.5, 0.5, 0.5, 1.0);
    this.setDiffuse(0.5, 0.5, 0.5, 1.0);
    this.setSpecular(0.5, 0.5, 0.5, 1.0);
    this.setShininess(10.0);
  }

  display() {

    // Clear image and depth buffer
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Setup camera and transformations
    this.updateProjectionMatrix();
    this.loadIdentity();
    this.applyViewMatrix();

    // Added
    this.lights[0].update();

    // Draw axis
    this.axis.display();
    this.setDefaultAppearance();

    // Draw the panorama first (it goes in the background)
    if (this.displayPanorama) this.panorama.display();

    // Draw the field
    if (this.displayField) this.field.display();

    // Place building at bottom-right corner of field
    if (this.displayBuilding) {
      this.pushMatrix();
      this.translate(-20, 0, -20); // Adjust to place the Building somewhere in the field
      this.building.display();
      this.popMatrix();
    }

    // Draw the forest
    if (this.displayForest) this.forest.display();

    if (this.heli) {
      this.pushMatrix();
    
      this.translate(-20, 0, -20); 
    
      const heliY = this.building.floorHeight * (this.building.floors + 1);
      this.translate(0, heliY + 0.5, 0); 
    
      this.heli.display();
      this.popMatrix();
    }

   
    this.lake.display();

    // Fires with animated shader
    this.setActiveShader(this.fireShader);
    this.fireTexture.bind(0);

    for (let i = 0; i < this.fires.length; i++) {
      const fire = this.fires[i];
      const { x, z } = this.firePositions[i];
  
      this.pushMatrix();
      this.translate(x, 0, z);
      fire.display();
      this.popMatrix();
    }
    // Restore default shader
    this.setActiveShader(this.defaultShader);
  }
}

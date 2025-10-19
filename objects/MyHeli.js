// MyHeli.js
import { CGFobject, CGFappearance } from '../../lib/CGF.js';
import { MySphere } from './../geometrics/MySphere.js';
import { MyCone } from './../geometrics/MyCone.js';
import { MyPlane } from './../geometrics/MyPlane.js';

/**
 * MyHeli
 * Represents a helicopter object with movement, orientation, animation (rotors),
 * altitude control, and water bucket mechanics.
 */
export class MyHeli extends CGFobject {
    constructor(scene) {
        super(scene);

        // === Geometric parts ===
        this.body = new MySphere(scene, 20, 20);     // Main spherical body
        this.tail = new MyCone(scene, 0.5, 5, 20);   // Tail cone
        this.topRotor = new MyPlane(scene, 1);       // Top rotor
        this.rearRotor = new MyPlane(scene, 1);      // Rear rotor
        this.plane = new MyPlane(scene, 1);          // Rotor arm / tail fin
        this.bucket = new MyCone(scene, 0.5, 1, 10); // Water bucket

        // === Materials ===
        this.bodyMaterial = new CGFappearance(scene);
        this.bodyMaterial.setAmbient(0.8, 0.2, 0.2, 1);
        this.bodyMaterial.setDiffuse(0.8, 0.2, 0.2, 1); // Red
        this.bodyMaterial.setSpecular(0.9, 0.9, 0.9, 1);
        this.bodyMaterial.setShininess(10);

        this.rotorMaterial = new CGFappearance(scene);
        this.rotorMaterial.setAmbient(0.1, 0.1, 0.1, 1);
        this.rotorMaterial.setDiffuse(0.2, 0.2, 0.2, 1); // Dark grey

        this.bucketMaterial = new CGFappearance(scene);
        this.bucketMaterial.setAmbient(0.1, 0.3, 0.7, 1); // Blue water
        this.bucketMaterial.setDiffuse(0.2, 0.5, 0.9, 1);

        // === Flight and Movement Variables ===
        this.altitude = 10;             // Target cruise altitude
        this.currentY = 0;              // Current vertical position
        this.pos = { x: 0, z: 0 };      // Position on the XZ plane
        this.rotation = 0;              // Y-axis orientation
        this.targetAltitude = 0;        // Used for ascending or descending logic
        this.maxTiltAngle = 0.2; // Max forward tilt angle for movement
        this.tiltAngle = 0; // Current tilt based on speed

        this.bladeAngle = 0;            // Angle of rotation for rotors (animated)
        this.bladeSpeed = 0.3;          // Speed of rotor spin

        this.movingDir = 1;

        this.baldeOffsetY = 0;          // Offset for dangling water bucket

        // === Kinematic State ===
        this.position = { x: 0, y: 0, z: 0 };
        this.orientation = 0; // Y-axis rotation
        this.velocity = { x: 0, z: 0 }; 
        this.speed = 0; 

        // === Water Mechanism States ===
        this.hasWater = false;
        this.releasingWater = false;
        this.releasingTimer = 0;
        this.state = 'idle'; // idle | descending | ascending | releasing
    }

    // === Control Methods ===
    liftOff() {
        if (this.state === 'idle') {
            this.state = 'ascending';
            this.targetAltitude = this.altitude;
        }
    }
    
    land() {
        if (this.state === 'idle') {
            this.state = 'descending';
            this.targetAltitude = -20;
        }
    }

    // Turn helicopter (Y rotation)
    turn(v) {
        this.orientation += v * 0.05;
        this.updateVelocityDirection();
    }
    
    // Accelerate forward or backward
    accelerate(v) {
        this.speed += v * 0.05;
        this.speed = Math.max(-1, Math.min(this.speed, 5)); // Clamp speed
        this.updateVelocityDirection();
    }
    
    // Calculate velocity vector based on current speed and direction
    updateVelocityDirection() {
        this.velocity.x = this.speed * Math.sin(this.orientation);
        this.velocity.z = -this.speed * Math.cos(this.orientation);
    }

    pickupWater() {
        const dx = this.position.x + 20 + 35; 
        const dz = this.position.z + 20 + 40;
        const dist = Math.sqrt(dx * dx + dz * dz);
    
        if (dist < 10 && !this.hasWater && this.state === 'idle') {
            this.targetAltitude = 0.5;
            this.state = 'descending';
        }
    }
    
    releaseWater() {
        if (this.hasWater && this.state === 'idle') {
            this.releasingWater = true;
            this.state = 'releasing';
            this.releasingTimer = 0;
        }
    }
    
    checkAndExtinguish() {
        if (this.scene && this.scene.extinguishFiresNear) {
            const x = this.position.x + 20;
            const z = this.position.z + 20;
            this.scene.extinguishFiresNear(x, z);
        }
    }
    

    // === Update function for animation/physics ===
    update(t) {
        const dy = this.targetAltitude - this.currentY;
    
        switch (this.state) {
            case 'descending':
                if (Math.abs(dy) > 0.1) {
                    this.currentY += dy * 0.05;
                } else {
                    this.currentY = this.targetAltitude;
                    if (!this.hasWater) {
                        this.hasWater = true;
                        this.state = 'ascending';
                        this.targetAltitude = this.altitude;
                    } else {
                        this.state = 'idle';
                    }
                }
                break;
    
            case 'ascending':
                if (Math.abs(dy) > 0.1) {
                    this.currentY += dy * 0.05;
                } else {
                    this.currentY = this.altitude;
                    this.state = 'idle';
                }
                break;
    
            case 'releasing':
                this.releasingTimer += t;
                if (this.releasingTimer > 1000) {
                    this.releasingTimer = 0;
                    this.hasWater = false;
                    this.releasingWater = false;
                    this.state = 'idle';
                    this.checkAndExtinguish();
                }
                break;
    
            default:
                if (Math.abs(dy) > 0.1) {
                    this.currentY += dy * 0.05;
                }
                this.position.x += this.velocity.x;
                this.position.z += this.velocity.z;
                break;
        }
    
        this.tiltAngle = this.maxTiltAngle * this.speed * -1;
    
        this.baldeOffsetY = this.currentY > 2
            ? Math.min(4, this.baldeOffsetY + 0.1)
            : Math.max(0, this.baldeOffsetY - 0.1);
    }
    
    
    // Resets helicopter to initial position and state
    reset() {
        this.position = { x: 0, y: 0, z: 0 };
        this.orientation = 0;
        this.velocity = { x: 0, z: 0 };
        this.speed = 0;
        this.currentY = 0;
        this.targetAltitude = 0;
    }
    
    // === Display / Render logic ===
    display() {
        this.bladeAngle += this.bladeSpeed; // Animate blade rotation

        this.scene.pushMatrix();
    
        // === Global transform ===
        this.scene.translate(this.position.x, this.currentY, this.position.z);
        this.scene.rotate(this.tiltAngle, 1, 0, 0); // Apply tilt
        this.scene.rotate(-this.orientation -Math.PI / 2, 0, 1, 0); // Face forward
        
       // === Body ===
        this.scene.pushMatrix();
        this.scene.translate(0, 10, 0);
        this.scene.scale(2, 1, 1);
        this.bodyMaterial.apply();
        this.body.display();
        this.scene.popMatrix();
    
       // === Tail ===
        this.scene.pushMatrix();
        this.scene.translate(-1.7, 10, 0);
        this.scene.rotate(Math.PI / 2, 0, 0, 1);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.tail.display();
        this.scene.popMatrix();
    
        // === Top Rotors (two planes rotated) ===
        this.scene.pushMatrix();
        this.scene.translate(0, 11, 0);
        this.scene.rotate(this.bladeAngle, 0, 1, 0);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(7, 0.5, 1);
        this.rotorMaterial.apply();
        this.topRotor.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, 11, 0);
        this.scene.rotate(this.bladeAngle, 0, 1, 0);
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(7, 0.5, 1);
        this.topRotor.display();
        this.scene.popMatrix();
    
       // === Rear Rotor ===
        this.scene.pushMatrix();
        this.scene.translate(-7, 10.65, 0);
        this.scene.rotate(Math.PI / 2, 0, 0, 1);
        this.scene.rotate(this.bladeAngle * 2, 0, 0, 1); // Faster spin
        this.scene.scale(0.1, 1.5, 1);
        this.rearRotor.display();
        this.scene.popMatrix();

        // === Tail Fin ===
        this.scene.pushMatrix();
        this.scene.translate(-6.5, 10.3, 0);
        this.scene.rotate(Math.PI / 2, 0, 0, 1);
        this.scene.rotate(-0.6, 0, 0, 1); // rotação adicional
        this.scene.scale(0.3, 1.7, -1);
        this.bodyMaterial.apply();
        this.plane.display();
        this.scene.popMatrix();
    
        // === Water Bucket ===
        this.scene.pushMatrix();
        this.scene.translate(0, 8.5 - this.baldeOffsetY, 0);
        this.bucketMaterial.apply();
        this.scene.scale(1, -1, 1); // Flip bucket vertically
        this.bucket.display();
        this.scene.popMatrix();
    
        this.scene.popMatrix(); // End of helicopter
    }
    
}

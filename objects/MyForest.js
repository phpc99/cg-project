import { CGFobject, CGFappearance, CGFtexture } from '../../lib/CGF.js';
import { MyTree } from './MyTree.js';

/**
 * MyForest
 * This class creates and displays a forest composed of multiple trees arranged in a grid,
 * with randomized positioning and appearance for realism.
 */
export class MyForest extends CGFobject {
    constructor(scene, rows, cols, trunkTexPath, crownTexPath, positionX = 0, positionZ = 0) {
        super(scene);
        this.positionX = positionX; // X offset of the entire forest
        this.positionZ = positionZ; // Z offset of the entire forest

        this.scene = scene;

        this.trees = []; // Array to hold all trees
        this.spacing = 10; // Grid spacing between trees in the forest

        this.initMaterials(trunkTexPath, crownTexPath); // Load textures
        this.initObjects(rows, cols); // Generate trees
    }

    /**
     * Loads trunk and crown textures using given paths.
     */
    initMaterials(trunkTexPath, crownTexPath) {
        this.trunkTex = new CGFtexture(this.scene, trunkTexPath);  // Tree trunk texture
        this.crownTex = new CGFtexture(this.scene, crownTexPath);  // Tree crown texture
    }

    /**
     * Generates tree instances with slight randomness for a natural look.
     * @param {number} rows - number of rows in the forest
     * @param {number} cols - number of columns in the forest
     */
    initObjects(rows, cols) {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                // Randomize parameters within ranges
                const tiltAngle = Math.random() * 10; // degrees
                const tiltAxis = Math.random() > 0.5 ? 'X' : 'Z';
                const trunkRadius = 0.5 + Math.random() * 0.3;
                const treeHeight = 8 + Math.random() * 4;
                const crownColor = [0.1 + Math.random() * 0.3, 0.5 + Math.random() * 0.4, 0.1 + Math.random() * 0.3];

                // Small random offset to avoid perfect grid appearance
                const offsetX = (Math.random() - 0.5) * 10;
                const offsetZ = (Math.random() - 0.5) * 10;

                const x = c * this.spacing + offsetX;
                const z = r * this.spacing + offsetZ;

                // Create and store the tree with its position
                this.trees.push({ 
                    x, 
                    z, 
                    tree: new MyTree(
                        this.scene, 
                        tiltAngle, 
                        tiltAxis, 
                        trunkRadius, 
                        treeHeight, 
                        crownColor, 
                        this.trunkTex, 
                        this.crownTex
                    ) 
                });
            }
        }
    }

    /**
     * Renders the forest by placing each tree at its computed position.
     */
    display() {
        this.scene.pushMatrix();
    
        // Move the whole forest to its origin position
        this.scene.translate(this.positionX, 0, this.positionZ);
        
        // Draw each tree in its own local transform
        for (const { x, z, tree } of this.trees) {
            this.scene.pushMatrix();
            this.scene.translate(x, 0, z);
            tree.display();
            this.scene.popMatrix();
        }
    
        this.scene.popMatrix();
    }
}

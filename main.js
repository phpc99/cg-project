
import {CGFapplication} from '../lib/CGF.js';
import { MyScene } from './MyScene.js';
import { MyInterface } from './MyInterface.js';

function main()
{
    // Create a new CGF application and attach it to the HTML document body
    var app = new CGFapplication(document.body);
    // Instantiate the custom scene (where all objects and logic are defined)
    var myScene = new MyScene();
    // Instantiate the user interface (GUI controls, etc.)
    var myInterface = new MyInterface();
    // Initialize the WebGL context and the application
    app.init();
    // Set the scene and interface for the application
    app.setScene(myScene);
    app.setInterface(myInterface);
    // Link the interface to use the scene's active camera
    myInterface.setActiveCamera(myScene.camera);

    app.run();
}

main();
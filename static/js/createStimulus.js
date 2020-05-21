// standard global variables
var pegContainer, pegScene, pegCamera, pegRenderer, pegControls, Pegmaterial, spriteMaterial, peg, mesh;
var pegLabelSprite;


/*
    Initialiation logic follos
 */
console.log('init 3js');
//Load our globals from this file. This is so we can call certain functions in other files
loadGlobals();
initPeg();
console.log('init done, begin animate...');
animatePeg();



// FUNCTIONS
function initPeg() {
// SCENE
pegScene = new THREE.Scene();

// CAMERA
var SCREEN_WIDTH = 300, SCREEN_HEIGHT = 250;
var VIEW_ANGLE = 6, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
pegCamera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
pegScene.add(pegCamera);
pegCamera.position.set(0,50,400);
pegCamera.lookAt(pegScene.position);

// RENDERER
if ( Detector.webgl ) {
  pegRenderer = new THREE.WebGLRenderer( {antialias:true} );
} else {
  pegRenderer = new THREE.CanvasRenderer();
}

pegRenderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
pegContainer = document.getElementById( 'ThreeJSPeg' );
pegContainer.appendChild( pegRenderer.domElement );
// CONTROLS
pegControls = new THREE.OrbitControls( pegCamera, pegRenderer.domElement );
pegControls.noTilt = true;
pegControls.noRotate = true;
pegControls.noZoom = true;

// LIGHT
hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
hemiLight.color.setHSL( 0.6, 1, 0.6 );
hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
hemiLight.position.set( 0, 50, 0 );
pegScene.add( hemiLight );

dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
dirLight.color.setHSL( 0.1, 1, 0.95 );
dirLight.position.set( -1, 1.75, 1 );
dirLight.position.multiplyScalar( 30 );
pegScene.add( dirLight );

// SKYBOX/FOG
var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0xFFFFFF, side: THREE.BackSide } );
var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
pegScene.add(skyBox);

//peg
peg = new THREE.CylinderGeometry( 5, 5, 15, 100);
Pegmaterial = new THREE.MeshPhongMaterial({ color: 0x000000, shininess: 30 });
mesh = new THREE.Mesh( peg, Pegmaterial );
mesh.position.set(0,0,10);
pegScene.add(mesh);
//Label
pegLabelSprite = makeTextSprite( "",
    { fontsize: 40, fontFamily: 'georgia'} );

//pegLabelSprite.position = mesh.position.clone();
    //(-12,20,10) pos
pegLabelSprite.position.set(mesh.position.x,mesh.position.y,mesh.position.z);
    //pegLabelSprite.position.set(0,0,0);
    //pegLabelSprite.center.set(-10,100);



pegScene.add( pegLabelSprite );
//mesh.add( pegLabelSprite );

//TODO: Figure out how to auto recenter the
setNewLabel('Label');

}

//Store previous scaling factor (str len)
let oldContentLength = null;
//used for resetting on stim change
let rootPosition = ['12','20','10'];

//creating a new Label for the objects by deleting the current one and replacing it.
function setNewLabel(content)
{

    let length = content.length;

pegPos = pegLabelSprite.position;
pegScene.remove(pegLabelSprite);
pegLabelSprite = makeTextSprite(content, { fontsize: 40} );

//Calculate bias x
let biasX = Math.exp(length * (.2 * Math.sqrt(32 / length)));
//biasX =
    //biasX = Math.pow(length/12.0, 1.2);
    biasX = pegLabelSprite.width/550;
console.log(`bias: ${biasX}`);


//Root x. RootPostiion[] not working for somereason
//pegLabelSprite.position.set(12  - biasX ,pegPos.y,pegPos.z);
    pegLabelSprite.position.set(pegPos.x ,pegPos.y,pegPos.z);
    pegLabelSprite.center.set(biasX,0.5);
pegScene.add(pegLabelSprite);
}


function makeTextSprite( message, parameters ) {
    if ( parameters === undefined ) parameters = {};

    var fontface = parameters.hasOwnProperty("fontface") ?
                    parameters["fontface"] : "Arial";

    var fontsize = parameters.hasOwnProperty("fontsize") ?
    parameters["fontsize"] : 18;

    var borderThickness = parameters.hasOwnProperty("borderThickness") ?
    parameters["borderThickness"] : 4;

    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
    parameters["backgroundColor"] : { r:255, g:255, b:255, a:0 };

    var canvas = document.createElement('canvas');
    context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;

    // get size data (height depends only on font size)
    var metrics = context.measureText( message );
    var textWidth = metrics.width;

    // text color
    context.fillStyle = "rgba(255, 255, 255, 1.0)";

    context.fillText( message, borderThickness, fontsize + borderThickness);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    // useScreenCoordinates is not a property of this material
    spriteMaterial = new THREE.SpriteMaterial( { map: texture } );
    spriteMaterial.color.setHex("0x000000");
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(100,50,1.0);
    sprite.center.set(0,1);
    sprite.width = textWidth;
    return sprite;
}

function animatePeg() {
requestAnimationFrame( animatePeg );
pegControls.update();
pegRenderer.render( pegScene, pegCamera);
}


function setPegRGB()
{
    var redHex = rgbToHex(document.getElementById("RvalueStim").value);
var greenHex = rgbToHex(document.getElementById("GvalueStim").value);
var blueHex = rgbToHex(document.getElementById("BvalueStim").value);
var stringHex = "0x" + redHex + greenHex + blueHex;
Pegmaterial.color.setHex(stringHex);
$("#id_stimr").val($("#sR").html());
$("#id_stimg").val($("#sG").html());
$("#id_stimb").val($("#sB").html());
}

function setPeg(r,g,b) {
  var redHex = rgbToHex(r);
  var greenHex = rgbToHex(g);
  var blueHex = rgbToHex(b);
  var stringHex = "0x" + redHex + greenHex + blueHex;
  Pegmaterial.color.setHex(stringHex);
}

function setLabel(r,g,b) {
  var redHex = rgbToHex(r);
  var greenHex = rgbToHex(g);
  var blueHex = rgbToHex(b);
  var stringHex = "0x" + redHex + greenHex + blueHex;
  spriteMaterial.color.setHex(stringHex);
}

function setLabelRGB(){
var redHex = rgbToHex(document.getElementById("lRvalueStim").value);
var greenHex = rgbToHex(document.getElementById("lGvalueStim").value);
var blueHex = rgbToHex(document.getElementById("lBvalueStim").value);
var stringHex = "0x" + redHex + greenHex + blueHex;
spriteMaterial.color.setHex(stringHex);
$("#id_labelr").val($("#lR").html());
$("#id_labelg").val($("#lG").html());
$("#id_labelb").val($("#lB").html());
}

function rgbToHex(rgb){
  var hex = Number(rgb).toString(16);
  if (hex.length < 2) {
    hex = "0" + hex;
  }
  return hex;

  function fullColorHex(r,g,b){
    var red = rgbToHex(r);
    var green = rgbToHex(g);
    var blue = rgbToHex(b);
    return red+green+blue;
  }
}

function refreshStimShape()
    {
        var name = $("#shapes").val();
        var r, g,b;
       if(name === "Cube") {
            pegScene.remove(mesh);

           peg = new THREE.CubeGeometry(10, 10, 10);
           r =rgbToHex(document.getElementById("RvalueStim").value);
           g =rgbToHex(document.getElementById("GvalueStim").value);
           b =rgbToHex(document.getElementById("BvalueStim").value);
           Pegmaterial = new THREE.MeshPhongMaterial({ color: "#"+r+""+g+""+b, shininess: 30 });

       // Pegmaterial = new THREE.MeshPhongMaterial({ color: 0x000000, shininess: 30 });
        mesh = new THREE.Mesh( peg, Pegmaterial );
        mesh.position.set(0,0,10);
        pegScene.add(mesh);
       }
       else if (name === "Cylinder") {
             pegScene.remove(mesh);
            peg = new THREE.CylinderGeometry( 5, 5, 15, 100 );
           r =rgbToHex(document.getElementById("RvalueStim").value);
           g =rgbToHex(document.getElementById("GvalueStim").value);
           b =rgbToHex(document.getElementById("BvalueStim").value);
           Pegmaterial = new THREE.MeshPhongMaterial({ color: "#"+r+""+g+""+b, shininess: 30 });

       // Pegmaterial = new THREE.MeshPhongMaterial({ color: 0x000000, shininess: 30 });
        mesh = new THREE.Mesh( peg, Pegmaterial );
        mesh.position.set(0,0,10);
        pegScene.add(mesh);
       }

       else if (name === "Cone") {
            pegScene.remove(mesh);
            peg = new THREE.CylinderGeometry( 0, 9, 12, 15, 1  );
            r =rgbToHex(document.getElementById("RvalueStim").value);
           g =rgbToHex(document.getElementById("GvalueStim").value);
           b =rgbToHex(document.getElementById("BvalueStim").value);
           Pegmaterial = new THREE.MeshPhongMaterial({ color: "#"+r+""+g+""+b, shininess: 30 });

        //Pegmaterial = new THREE.MeshPhongMaterial({ color: 0x000000, shininess: 30 });
        mesh = new THREE.Mesh( peg, Pegmaterial );
        mesh.position.set(0,0,10);
        pegScene.add(mesh);

       }

}
/*
Abstracted the onReady into an actual function that we will call from the other js.
 */

function loadGlobals(){
    if(!window.sosa){
        console.log('Registering global window.sosa');
        window.sosa = {};
    }
    if(!window.sosa.refreshStimShape){
        console.log('Registering global refreshStimLShape to window.sosa');
        window.sosa.refreshStimShape = this.refreshStimShape;
    }
    if(!window.sosa.updateStimLabelRender){
        console.log('Registering global refreshStimLShape to window.sosa');
        window.sosa.updateStimLabelRender = this.setNewLabel;
    }

}




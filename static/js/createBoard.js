var BoardContainer, BoardScene, BoardCamera, BoardRenderer, BoardControl, Boardmaterial, skyBoxMaterial, BoardCoverBool,
    BoardCoverColor, BoardColor,mDragControls;
var BoardMesh, BoardMeshBackup;

let renderingImage = false; // When true, it instructs the program to revert the mesh if the user detoggles and plays with the slider

var objects = [];
var objectOnBoard = [];
var objectPosition = [];


var array = [];

var defaults = {
    board_b : 255,
    board_g : 255,
    board_r : 255
};
// data vars to be updated
let data_board_b  = defaults.board_b;
let data_board_r = defaults.board_r;
let data_board_g = defaults.board_g;





BoardCoverBool = false;
BoardCoverColor = "0x0000FF";
initBoard();
animateBoard();

function initBoard() {
    // SCENE
    BoardScene = new THREE.Scene();

    // CAMERA
    var SCREEN_WIDTH = 500, SCREEN_HEIGHT = 500;
    var VIEW_ANGLE = 5, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
    BoardCamera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    BoardScene.add(BoardCamera);
    BoardCamera.position.set(0, 0, 400);
    BoardCamera.lookAt(BoardScene.position);

    // RENDERER
    if (Detector.webgl) {
        BoardRenderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
    } else {
        BoardRenderer = new THREE.CanvasRenderer();
    }
    BoardRenderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    BoardContainer = document.getElementById('ThreeJSBoard');
    BoardContainer.appendChild(BoardRenderer.domElement);
    // CONTROLS
    BoardControl = new THREE.OrbitControls(BoardCamera, BoardRenderer.domElement);
    mDragControls = new THREE.DragControls(objects, BoardCamera, BoardRenderer.domElement);
    mDragControls.addEventListener('dragstart', function (event) {
        BoardControl.enabled = false;
    });
    mDragControls.addEventListener('dragend', function (event) {
        BoardControl.enabled = true;
    });


    // LIGHT
    hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 50, 0);
    BoardScene.add(hemiLight);

    dirLight = new THREE.DirectionalLight(0xdfebff, 1);
    dirLight.position.set(50, 200, 100);
    dirLight.position.multiplyScalar(1.3);

    BoardScene.add(dirLight);

    // SKYBOX/FOG
    var skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
    skyBoxMaterial = new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.BackSide});
    var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
    BoardScene.add(skyBox);

    //Board Back
    var board = new THREE.PlaneGeometry(24, 24);
    Boardmaterial = new THREE.MeshPhongMaterial({color: 0xffffff, specular: 0x05050, ambientLight: 0x0, shininess: 30});
    BoardMesh = new THREE.Mesh(board, Boardmaterial);
    BoardMesh.position.set(0, 0, -1);
    BoardMesh.rotation.y = Math.PI;
    BoardScene.add(BoardMesh);


    //Board Front
    var board = new THREE.PlaneGeometry(24, 24);
    Boardmaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff, /*specular: 0x05050,*/
        ambientLight: 0x0,
        shininess: 30
    });
    //Just change the board material and rerender to  load image
    BoardMesh = new THREE.Mesh(board, Boardmaterial);
    BoardMesh.position.set(0, 0, 0);
    BoardScene.add(BoardMesh);


    //Creates meshes on the sides of the board to make it look 3D
    var BoardSideGeo = new THREE.PlaneGeometry(24, 1);
    var BoardSideMat = new THREE.MeshPhongMaterial({color: 0xC0C0C0});
    var BoardSide = new THREE.Mesh(BoardSideGeo, BoardSideMat);
    BoardSide.position.set(0, 12, -0.5);
    BoardSide.rotation.x = -Math.PI / 2;
    BoardScene.add(BoardSide);
    var BoardSide = new THREE.Mesh(BoardSideGeo, BoardSideMat);
    BoardSide.rotation.x = -Math.PI / 2;
    BoardSide.rotation.y = -Math.PI / 2;
    BoardSide.position.set(-12, 0, -0.5);
    BoardScene.add(BoardSide);
    var BoardSide = new THREE.Mesh(BoardSideGeo, BoardSideMat);
    BoardSide.rotation.x = -Math.PI / 2;
    BoardSide.rotation.y = -Math.PI / 2 * 2;
    BoardSide.position.set(0, -12, -0.5);
    BoardScene.add(BoardSide);
    var BoardSide = new THREE.Mesh(BoardSideGeo, BoardSideMat);
    BoardSide.rotation.x = -Math.PI / 2;
    BoardSide.rotation.y = -Math.PI / 2 * 3;
    BoardSide.position.set(12, 0, -0.5);
    BoardScene.add(BoardSide);


}
function addBoardImage(imageUrl) {
    renderingImage = true;
 //   mBrdMesh.material.map = THREE.ImageUtils.loadTexture(image);
//    mBrdMesh.material.color.setHex("0xffffff");
//    mBrdMesh.needsUpdate = true;
    BoardScene.remove(BoardMesh);

    //create new plane geometry
    let board = new THREE.PlaneGeometry(24, 24);
    //load the iamge as a texture, make sure to use the callbacks
    let imgMaterial = new THREE.MeshLambertMaterial({
        map: new THREE.TextureLoader().load(imageUrl, () => {
            console.log('Loaded image texture')
        }, ()=>{
            console.log('Loading image texture')
        },
            (err) =>{
            console.error('Failed Image Texture Load!');
            if(err)
                console.error('Was unable to load image texture ' + Object.keys(err))
            })
    });
    //Just change the board material and rerender to  load image
    BoardMesh = new THREE.Mesh(board, imgMaterial);
    BoardMesh.position.set(0, 0, 0);
    BoardScene.add(BoardMesh);

}

//updates grid selection if user changes dropdown option
function updateGrid(Input) {
    document.getElementById('StartExperimentButton').href = "SOSA.html?demo=" + Input;
}

//functions to convert rgb to hex (Source: https://campushippo.com/lessons/how-to-convert-rgb-colors-to-hexadecimal-with-javascript-78219fdb)
function rgbToHex(rgb) {
    var hex = Number(rgb).toString(16);
    if (hex.length < 2) {
        hex = "0" + hex;
    }
    return hex;
}

function fullColorHex(r, g, b) {
    var red = rgbToHex(r);
    var green = rgbToHex(g);
    var blue = rgbToHex(b);
    return red + green + blue;
}


function animateBoard() {
    requestAnimationFrame(animateBoard);
    boardLock();
    BoardControl.update();
    BoardRenderer.render(BoardScene, BoardCamera);
}

//creates a board cover
function ToggleCover() {
    BoardCoverBool = !BoardCoverBool;
    if (BoardCoverBool) {
        Boardmaterial.color.setHex(BoardCoverColor);
    } else {
        Boardmaterial.color.setHex(BoardColor);
    }
}

//sets tilt lock
function setTiltLock() {
    BoardControl.noTilt = !BoardControl.noTilt;
    BoardControl.update();

}

//sets rotate lock
function setRotLock() {
    BoardControl.noRotate = !BoardControl.noRotate;
    BoardControl.update();
}

//sets zoom lock
function setZoomLock() {
    BoardControl.noZoom = !BoardControl.noZoom;
    BoardControl.update();
}

//updates the color of the board
function setBoardRGB(firstLoad = false) {
    // update this fucntion to pull from the data variables

    let redHex,greenHex,blueHex;
        redHex = rgbToHex(document.getElementById("BoardRvalue").value);
        greenHex = rgbToHex(document.getElementById("BoardGvalue").value);
        blueHex = rgbToHex(document.getElementById("BoardBvalue").value);


    /*
    let redHex = _rgbToHex(data_board_r);
    let blueHex = _rgbToHex(data_board_b);
    let greenHex = _rgbToHex(data_board_g);
    */
    BoardColor = "0x" + redHex + greenHex + blueHex;

    if (!BoardCoverBool) {
        Boardmaterial.color.setHex(BoardColor);
        $("#id_boardr").val($("#Rbv").html());
        $("#id_boardg").val($("#Gbv").html());
        $("#id_boardb").val($("#Bbv").html());
    }
}

function resetBoardRender(){
            if(!renderingImage){
                console.warn('No image render to reset!');
                return;
            }
            console.warn(
                'Resetting board render as user has changed a slider value. You may want to alert/confirm before me! There is a backup mesh.'
            );
            //First save the current render, likely n image mesh.
            BoardMeshBackup = BoardMesh;
            BoardScene.remove(BoardMesh);
            //Board Front
            var board = new THREE.PlaneGeometry(24, 24);
            Boardmaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff, /*specular: 0x05050,*/
                ambientLight: 0x0,
                shininess: 30
            });
            //Just change the board material and rerender to  load image
            BoardMesh = new THREE.Mesh(board, Boardmaterial);
            BoardMesh.position.set(0, 0, 0);
            BoardScene.add(BoardMesh);
            //Update render
            setBoardRGB();
            //set flag
            renderingImage = false;

}
//Used to determine if we should save or clear the board background image to prevent future loads.
function isRenderingImage(){
    return renderingImage;
}
function hasBackupMesh(){
    return !!BoardMeshBackup;
}
function renderBackupMesh(){
    //Just change the board material and rerender to  load image
            BoardMesh =BoardMeshBackup; // It's safe to assume this will be an imageMesh? It's javascript so we just have to trust in he logic LOL
            BoardMesh.position.set(0, 0, 0);
            BoardScene.add(BoardMesh);
            //Flag
            renderingImage = true;
}

//updates the color of the background
function setBackgroundRGB(firstLoad = false) {
    let redHex, blueHex, greenHex;

    redHex = rgbToHex(document.getElementById("BackgroundRvalue").value);
    greenHex = rgbToHex(document.getElementById("BackgroundGvalue").value);
    blueHex = rgbToHex(document.getElementById("BackgroundBvalue").value);


    var stringHex = "0x" + redHex + greenHex + blueHex;

    skyBoxMaterial.color.setHex(stringHex);
    $("#id_boardbackgroundr").val($("#Rbgv").html());
    $("#id_boardbackgroundg").val($("#Gbgv").html());
    $("#id_boardbackgroundb").val($("#Bbgv").html());
}

//updates the color of the board cover
function setBoardCoverRGB() {
    var redHex = rgbToHex(document.getElementById("CoverRvalue").value);
    var greenHex = rgbToHex(document.getElementById("CoverGvalue").value);
    var blueHex = rgbToHex(document.getElementById("CoverBvalue").value);
    BoardCoverColor = "0x" + redHex + greenHex + blueHex;

    if (BoardCoverBool) {
        Boardmaterial.color.setHex(BoardCoverColor);
    }
}



function ClearOff() {
    BoardMesh.material.map = null;
    BoardMesh.needsUpdate = true;
}

function boardLock() {


    for (var i = 0; i < objects.length; i++) {


        if (objects[i].position.y <= 12 && objects[i].position.y >= -12 && objects[i].position.x <= 12 && objects[i].position.x >= -12) {

            objectOnBoard[i] = true;

        }

        if (objectOnBoard[i] == true) {

            if (objects[i].position.x < -12) {

                objects[i].position.x = -12;
            }

            if (objects[i].position.x > 12) {

                objects[i].position.x = 12;
            }

            if (objects[i].position.y < -12) {

                objects[i].position.y = -12;
            }

            if (objects[i].position.y > 12) {

                objects[i].position.y = 12;
            }

            objects[i].position.z = 0.5;

        }

    }
}
function stimToBoard(button, stimr, stimg, stimb, stimshape) {

    $(document).ready(function () {
        $(button).attr('disabled', true);

        var peg, color, Pegmaterial, mesh;

        if (stimshape === "Cube") {
            peg = new THREE.CubeGeometry(1, 1, 1);
            color = new THREE.Color("rgb(" + stimr + ", " + stimg + ", " + stimb + ")");
            Pegmaterial = new THREE.MeshPhongMaterial({color: color, shininess: 30});
            mesh = new THREE.Mesh(peg, Pegmaterial);
            mesh.position.set(-12, 12, 1);
            BoardScene.add(mesh);
            objects.push(mesh);
            objectOnBoard.push(false);
            objectPosition.push(mesh.position);
        }
        if (stimshape === "Cylinder") {
            peg = new THREE.CylinderGeometry(0.5, 0.5, 1, 64);
            color = new THREE.Color("rgb(" + stimr + ", " + stimg + ", " + stimb + ")");
            Pegmaterial = new THREE.MeshPhongMaterial({color: color, shininess: 30});
            mesh = new THREE.Mesh(peg, Pegmaterial);
            mesh.position.set(-12, 12, 0.5);
            BoardScene.add(mesh);
            objects.push(mesh);
            objectOnBoard.push(false);
            objectPosition.push(mesh.position);
        }
        if (stimshape === "Cone") {
            peg = new THREE.CylinderGeometry(0, 0.5, 1, 64);
            color = new THREE.Color("rgb(" + stimr + ", " + stimg + ", " + stimb + ")");
            Pegmaterial = new THREE.MeshPhongMaterial({color: color, shininess: 30});
            mesh = new THREE.Mesh(peg, Pegmaterial);
            mesh.position.set(-12, 12, 0.5);
            BoardScene.add(mesh);
            objects.push(mesh);
            objectOnBoard.push(false);
            objectPosition.push(mesh.position);
        }
    })
}

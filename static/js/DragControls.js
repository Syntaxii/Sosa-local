/*
 * @author zz85 / https://github.com/zz85
 * @author mrdoob / http://mrdoob.com
 * Running this will allow you to drag three.js objects around the screen.
 */
var _selected;
var myarray = [];
var count = 0;

THREE.DragControls = function (_objects, _camera, _domElement) {

    if (_objects instanceof THREE.Camera) {

        console.warn('THREE.DragControls: Constructor now expects ( objects, camera, domElement )');
        var temp = _objects;
        _objects = _camera;
        _camera = temp;

    }

    var _plane = new THREE.Plane();
    var _raycaster = new THREE.Raycaster();

    var _mouse = new THREE.Vector2();
    var _offset = new THREE.Vector3();
    var _intersection = new THREE.Vector3();

    _selected = null;
    var _hovered = null;

    //

    var scope = this;

    function activate() {

        _domElement.addEventListener('mousemove', onDocumentMouseMove, false);
        _domElement.addEventListener('mousedown', onDocumentMouseDown, false);
        _domElement.addEventListener('mouseup', onDocumentMouseCancel, false);
        _domElement.addEventListener('mouseleave', onDocumentMouseCancel, false);
        _domElement.addEventListener('touchmove', onDocumentTouchMove, false);
        _domElement.addEventListener('touchstart', onDocumentTouchStart, false);
        _domElement.addEventListener('touchend', onDocumentTouchEnd, false);

    }
    
    function deactivate() {

        _domElement.removeEventListener('mousemove', onDocumentMouseMove, false);
        _domElement.removeEventListener('mousedown', onDocumentMouseDown, false);
        _domElement.removeEventListener('mouseup', onDocumentMouseCancel, false);
        _domElement.removeEventListener('mouseleave', onDocumentMouseCancel, false);
        _domElement.removeEventListener('touchmove', onDocumentTouchMove, false);
        _domElement.removeEventListener('touchstart', onDocumentTouchStart, false);
        _domElement.removeEventListener('touchend', onDocumentTouchEnd, false);

    }

    function dispose() {

        deactivate();

    }

    function onDocumentMouseMove(event) {

        event.preventDefault();

        var rect = _domElement.getBoundingClientRect();

        _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        _raycaster.setFromCamera(_mouse, _camera);

        if (_selected && scope.enabled) {

            if (_raycaster.ray.intersectPlane(_plane, _intersection)) {

                _selected.position.copy(_intersection.sub(_offset));

            }

            scope.dispatchEvent({type: 'drag', object: _selected});

            return;

        }

        _raycaster.setFromCamera(_mouse, _camera);

        var intersects = _raycaster.intersectObjects(_objects);

        if (intersects.length > 0) {

            var object = intersects[0].object;

            _plane.setFromNormalAndCoplanarPoint(_camera.getWorldDirection(_plane.normal), object.position);

            if (_hovered !== object) {

                scope.dispatchEvent({type: 'hoveron', object: object});

                _domElement.style.cursor = 'pointer';
                _hovered = object;

            }

        } else {

            if (_hovered !== null) {

                scope.dispatchEvent({type: 'hoveroff', object: _hovered});

                _domElement.style.cursor = 'auto';
                _hovered = null;

            }

        }

    }

    function onDocumentMouseDown(event) {

        event.preventDefault();

        _raycaster.setFromCamera(_mouse, _camera);

        var intersects = _raycaster.intersectObjects(_objects);

        if (intersects.length > 0) {

            _selected = intersects[0].object;

            if (_raycaster.ray.intersectPlane(_plane, _intersection)) {

                _offset.copy(_intersection).sub(_selected.position);

            }

            _domElement.style.cursor = 'move';

            scope.dispatchEvent({type: 'dragstart', object: _selected});

            for (var v = 0; v < objects.length; v++) {

                if (objects[v] == _selected) {
                    
                    var timeStamp = new Date();
                    objectPosition[v] = _selected.position;

                    //push moving object's initial coordinates and time into array
                    myarray.push([v , objectPosition[v].x, objectPosition[v].y, timeStamp.toLocaleTimeString().toString()]);
                    //print out array contents
                    console.log("Object: " + myarray[myarray.length-1][0] + " X Value: " + myarray[myarray.length-1][1] + " Y Value: " + myarray[myarray.length-1][2] + " " + myarray[myarray.length-1][3]);

                    //FOR TESTING, print out raw initial coordinates and time 
                    //console.log("Object: " + v + " START X: " + objectPosition[v].x + " Y: " + objectPosition[v].y + " " + timeStamp.toLocaleTimeString());
                    //console.log(v + " (" + objectPosition[v].x + "," + objectPosition[v].y + ")");
                }

            }

        }


    }



    function onDocumentMouseCancel(event) {

        event.preventDefault();

        if (_selected) {

            scope.dispatchEvent({type: 'dragend', object: _selected});

            for (var v = 0; v < objects.length; v++) {

                if (objects[v] == _selected) {

                    var timeStamp = new Date();
                    objectPosition[v] = _selected.position;

                    //push moving objects ending coordinates and time into array 
                    myarray.push([v , objectPosition[v].x, objectPosition[v].y, timeStamp.toLocaleTimeString().toString()]);
                    //print out array contents
                    console.log("Object: " + myarray[myarray.length-1][0] + " X Value: " + myarray[myarray.length-1][1] + " Y Value: " + myarray[myarray.length-1][2] + " " + myarray[myarray.length-1][3]);
                   
                    //FOR TESTING, print out ending coordinates and time
                    //console.log("Object: " + v + " END X: " + objectPosition[v].x + " Y: " + objectPosition[v].y + " " + timeStamp.toLocaleTimeString());
                    //console.log("Success");
                    //console.log(v + " (" + objectPosition[v].x + "," + objectPosition[v].y + ")");
                    
                }

            }
            _selected = null;

        }
        _domElement.style.cursor = _hovered ? 'pointer' : 'auto';
        //Makes visualizing the data in the array much easier
        console.table(myarray);
    }

    function onDocumentTouchMove(event) {

        event.preventDefault();
        event = event.changedTouches[0];

        var rect = _domElement.getBoundingClientRect();

        _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        _raycaster.setFromCamera(_mouse, _camera);

        if (_selected && scope.enabled) {

            if (_raycaster.ray.intersectPlane(_plane, _intersection)) {

                _selected.position.copy(_intersection.sub(_offset));

            }

            scope.dispatchEvent({type: 'drag', object: _selected});



        }

    }

    function onDocumentTouchStart(event) {

        event.preventDefault();
        event = event.changedTouches[0];

        var rect = _domElement.getBoundingClientRect();

        _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        _raycaster.setFromCamera(_mouse, _camera);

        var intersects = _raycaster.intersectObjects(_objects);

        if (intersects.length > 0) {

            _selected = intersects[0].object;

            _plane.setFromNormalAndCoplanarPoint(_camera.getWorldDirection(_plane.normal), _selected.position);

            if (_raycaster.ray.intersectPlane(_plane, _intersection)) {

                _offset.copy(_intersection).sub(_selected.position);

            }

            _domElement.style.cursor = 'move';

            scope.dispatchEvent({type: 'dragstart', object: _selected});

        }


    }

    function onDocumentTouchEnd(event) {

        event.preventDefault();

        if (_selected) {

            scope.dispatchEvent({type: 'dragend', object: _selected});

            _selected = null;

        }

        _domElement.style.cursor = 'auto';

    }

    activate();

    // API

    this.enabled = true;

    this.activate = activate;
    this.deactivate = deactivate;
    this.dispose = dispose;

    // Backward compatibility

    this.setObjects = function () {

        console.error('THREE.DragControls: setObjects() has been removed.');

    };

    this.on = function (type, listener) {

        console.warn('THREE.DragControls: on() has been deprecated. Use addEventListener() instead.');
        scope.addEventListener(type, listener);

    };

    this.off = function (type, listener) {

        console.warn('THREE.DragControls: off() has been deprecated. Use removeEventListener() instead.');
        scope.removeEventListener(type, listener);

    };

    this.notify = function (type) {

        console.error('THREE.DragControls: notify() has been deprecated. Use dispatchEvent() instead.');
        scope.dispatchEvent({type: type});

    };

};

THREE.DragControls.prototype = Object.create(THREE.EventDispatcher.prototype);
THREE.DragControls.prototype.constructor = THREE.DragControls;

saveToDB = async function() {
    var counter = 0;

    //name the objects
    for (var i = 0; i < myarray.length; i++) {
        let experimentName = sessionStorage.getItem("experimentName");
        let testTakerName = sessionStorage.getItem("testTakerName");
        testTakerName = testTakerName + counter;

        //Url that connects to the endpoint "EndResults"
        let url = BASE_URL + '/api/results'

        //Create the Results "object"
        let data = new FormData()

        data.append('experimentName', experimentName);
        data.append('testerName', testTakerName);
        data.append('stimNum', myarray[i][0]);
        data.append('stimX', myarray[i][1]);
        data.append('stimY', myarray[i][2]);
        data.append('timeStamp', myarray[i][3]);
        
        //ajax call to the endpoint in views.py
        await axios.post(url, data).then(
            (request)=>{
                console.log('Saving Complete');
            }
        )
        .catch( (err) => {
            console.error('Failed to save result ' + err.message);
        })
        counter++;
        
    }

    onExperimentFinished();
    
}

//Export myarray data to excel file
exportToCsv = function() {
    let experimentName = sessionStorage.getItem("experimentName");
    let testTakerName = sessionStorage.getItem("testTakerName");
    
    var CsvString = "Experiment Name, Test Taker Name, Stim ID, From, To, Start Time, End Time\r\n";
    var startTime = "";

    myarray.forEach(function (RowItem, RowIndex) {
        if(RowIndex % 2 == 0) {
            CsvString += experimentName + ',' + testTakerName + ',' + myarray[RowIndex][0] + ',"(' + myarray[RowIndex][1] + ', ' + myarray[RowIndex][2] + ')","(';
            startTime = myarray[RowIndex][3];
        } else {
            CsvString += myarray[RowIndex][1] + ', ' + myarray[RowIndex][2] + ')",' + startTime + ',' + myarray[RowIndex][3];
            CsvString += "\r\n";
        }
    });

    CsvString = "data:application/csv," + encodeURIComponent(CsvString);
    var x = document.createElement("A");
    x.setAttribute("href", CsvString );
    x.setAttribute("download",experimentName + "-" + testTakerName + ".csv");
    document.body.appendChild(x);
    x.click();
}


function onExperimentClick() {
    $("#submitExperiment").hide();

    let csvContent = "data:text/csv;charset=utf-8,";
    myarray.forEach(function (rowArray) {
        let row = rowArray.join(",");
        console.log("Hello ");
        csvContent += row + "\r\n";
    });

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_data.csv");
    link.setAttribute("class", "btn btn-success");
    link.innerHTML += "CSV Results";
    $("#links").append(link);

      //add the preserveDrawingBuffer: true to this in other file

    console.log(mBrdRenderer.domElement.toDataURL());

    link2 = document.createElement("a");
    link2.setAttribute("href", mBrdRenderer.domElement.toDataURL());
    link2.setAttribute("class", "btn btn-success");
    link2.innerHTML += "Image of Experiment";
     $("#links").append(link2);


}

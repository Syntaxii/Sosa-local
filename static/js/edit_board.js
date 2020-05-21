//file gloabals
    let CLOUDINARY_MAX_SIZE = 85760;

let mBoard = null;
let mCurrentSelectedImage = null;

let alertTimeout = 1500;

let loading = false;
let saving = false;
let uploading = false;

//Cloudinary, a custom implementation
let cloudinary = {
    uploadImage: function(dataUrl, onComplete, onError = () =>{console.error('Failed  image upload!')}){
        //Setup request
        let url = 'https://api.cloudinary.com/v1_1/gsusosa/image/upload';
        let data = new FormData();
        data.append('file', dataUrl); //Should be base 64 encoded by this point!!!!!
        data.append('upload_preset', 'default');
        axios.post(url,data).then(
            (request)=>{
                console.log('Upload Complete');
                uploading = false;
                onComplete(request.data)
                /*
                    Sample response
                {
                     "public_id": "sample_spreadsheet.xls",
                     "version": 1371928603,
                     "signature": "9088291a2c12202767cfa7c5e874afee72be78cd",
                     "resource_type": "raw",
                     "created_at": "2017-06-22T19:16:43Z",
                     "tags": [],
                     "bytes": 6144,
                     "type": "upload",
                     "etag": "107bf134b5afd11cc7544d60108d87b",
                     "url": "http://res.cloudinary.com/demo/raw/upload/v1371928603/sample_spreadsheet.xls",
                     "secure_url": "https://res.cloudinary.com/demo/raw/upload/v1371928603/sample_spreadsheet.xls"
                     "original_filename": "sample_spreadsheet"
                    }
                 */
            }
        )
            .catch((err)=>{
                console.error('Hit error with image upload!');
                uploading = false;
                onError(err);
            })
    }
};



//Lifecycle methods
onInit();

//Very first thing ran. Nothing guranteed in this stage of the lifecycle.
function onInit(){
    disableScreen();
    getBoardAndLinkAsync();

}


//Called when the board is attached
function onAttach(){

    if(!mBoard.boardbackgroundurl){
        //Hide image select if  no image
       hideImagePanelAndShowSlides();

    }
    else{
        hideBoardSlidersAndShowImagePane();
        //Load image
        //todo: once we get https up for our site and CORS stops bitching, we should switch these to use the more secure url[1] which is https.
        let urls = mBoard.boardbackgroundurl.split('>'); //Remember [0] is http [1] is https
        addBoardImage(urls[0]);
        //Fix UI
        //Set use custom image to true
        let toggle = $('#imageToggle');
       // toggle.prop('checked', !toggle.checked );
        toggle.bootstrapToggle('on');
        //Load image into preview
        $('#imgPreview').attr('src', urls[0]);
    }
    attachImageSelectClick();
    attachImageUploadClick();

    showAlert('info','Load Complete.', true, 2500);
}

function onSaved(){
    showAlert('info','Saved successfully!', true);
}

//body methods
//Requests the board from the server, calls onAttach() when done.
function getBoardAndLinkAsync(){
    loading = true;
    let url = `${BASE_URL}/api/boards/${data_editboard_exId}`;
    axios.get(url).then((response) => {
        console.log('success loading board as:' + response.data + ' \n' + Object.keys(response.data.items));
        setBoard(response.data.items);
        loading = false;
        onAttach();
    }).catch((err) =>{
        console.error('failure loading' + err.message);
        showAlert('error','Failed loading board, please try again later!\nDetails: '+err.message,true,50000000);
        loading = false;
    })
}
function saveBoardAsync(){
    if(saving){
        console.warn('Already saving!');
        return;
    }
    showAlert('info', 'Saving...', true, 500000);
    saving = true;
    let url = `${BASE_URL}/api/board/set`;
    //Load data for request
    let data = new FormData();
    data.append('exId', data_editboard_exId);
    data.append('uid',data_editboard_userId);

    //If rendering image, save the boardBackgroundUrl, else drop it.
    if(!isRenderingImage()){
        mBoard.boardbackgroundurl = null;
    }

    data.append('board', JSON.stringify(mBoard));

    axios.post(url,data).then( (request) =>{
        //success
        if(request.data.status){
            if(request.data.status === 'err'){
                console.error('Trouble saving! '+ request.data.message);
                throw request.data.message
            }
        }
        console.log('save complete...');
        saving = false;
        onSaved();
    }).catch( (error) =>{
        showAlert('warning', 'Save was unsuccessful, please try again later.\nDetails: '+ error.message);
        saving = false;
    })
}




function handleToggleImgSelect(checkbox) {
    let toggled = $(checkbox).prop('checked');
    if(toggled){
        hideBoardSlidersAndShowImagePane();
        if(hasBackupMesh()){
            renderBackupMesh();
        }
    }
    else{
        hideImagePanelAndShowSlides();
        //Fix image not resetting
        resetBoardRender();
    }
}

function hideBoardSlidersAndShowImagePane(){
    $('#boardColorSliders').css('display','none');
    $('#imgSelectButtonPanel').css('display','block');
    $('#imageSelectPanel').css('display','block');
}
function hideImagePanelAndShowSlides() {
    $('#boardColorSliders').css('display','block');
    $('#imageSelectPanel').css('display','none');
    $('#imgSelectButtonPanel').css('display','none');

}

function handleChangeBoardRGB() {
    mBoard.boardr = $('#BoardRvalue').val();
    mBoard.boardg = $('#BoardGvalue').val();
    mBoard.boardb = $('#BoardBvalue').val();
    setBoardRGB();
}

function handleChangeBoardBgRGB() {
    mBoard.boardbackgroundr = $('#BackgroundRvalue').val();
    mBoard.boardbackgroundg = $('#BackgroundGvalue').val();
    mBoard.boardbackgroundb = $('#BackgroundBvalue').val();
    setBackgroundRGB();
}

function setBoard(board){
    if(mBoard){
        console.warn('setBoard executed, but board already exists.');
    }
    mBoard = board;
    //Sync
    syncBoardWithGUI();
    console.log('board set!')
}

function syncBoardWithGUI(){
    //Set slider values then call whatever function they have attached to the sliders
    $('#BoardRvalue').val(mBoard.boardr);
    $('#BoardGvalue').val(mBoard.boardg);
    $('#BoardBvalue').val(mBoard.boardb);
    $('#BackgroundRvalue').val(mBoard.boardbackgroundr);
    $('#BackgroundGvalue').val(mBoard.boardbackgroundg);
    $('#BackgroundBvalue').val(mBoard.boardbackgroundb);
    //Update (value) labels for the sliders
    $('#Rbv').text(mBoard.boardr);
    $('#Gbv').text(mBoard.boardg);
    $('#Bbv').text(mBoard.boardb);
     $('#Rbgv').text(mBoard.boardbackgroundr);
    $('#Gbgv').text(mBoard.boardbackgroundg);
    $('#Bbgv').text(mBoard.boardbackgroundb);

    setBoardRGB();
    setBackgroundRGB();

}

function disableScreen(){
    $('#content').css('pointer-events','none');
}

function attachImageUploadClick(){
    $('#uploadImageButton').on('click',
        () =>{
            handleUpload();
        }
    )
}
function attachImageSelectClick(){
    $('#chooseImageButton').on('click',
        () =>{
            $('#imgInput').trigger('click')
        }
    )
}

function loadInputData(input){
    if(!FileReader.DONE){
        console.error('No File API in this browser!');
        return;
    }
    if(!input.files){
        console.warn('No file selected for input!');
        return
    }
    if(input.files[0].size > CLOUDINARY_MAX_SIZE){
        showAlert('warning', 'Your image is too big! Please select another!');
        //clear the img
        $('#imgInput').val('');
        return;
    }
     if (input.files && input.files[0]) {
        let reader = new FileReader();
        reader.onload = function(e) {
            $('#imgPreview').attr('src', e.target.result);
            mCurrentSelectedImage = e.target.result;
        };
    console.log('Loading image');
    reader.readAsDataURL(input.files[0]);
  }
}

function handleUpload(){
    if(!mCurrentSelectedImage){
        showAlert('warning','You cannot do that until you have selected an image!', true);
        return;
    }
    showAlert('info', 'Uploading image...', false, 5000000);
    //Change UI State
    $('#uploadImageButton').text('Busy...').prop('disabled',true);

    cloudinary.uploadImage(mCurrentSelectedImage, (data) =>{
        //We concat the secure ANhaD unsecure urls split it with '>' then render
        mBoard.boardbackgroundurl = data.url + '>' +data.secure_url;
        //Render the image
        addBoardImage(mCurrentSelectedImage);
        //Fix UI State
        $('#uploadImageButton').text('Upload Image').prop('disabled',false);
        showAlert('info','Upload Complete!', true);
    },
        (err) =>{
            $('#uploadImageButton').text('Upload Image').prop('disabled',false);
            showAlert('error','Upload Failed, please try agian later!', true);
        })
}


//Util Functions
function clearAlerts(fadeOut = false){
    // noinspection JSJQueryEfficiency
   if(fadeOut){
        $('#alertPanel').fadeOut(
        1500, () =>{
            $('#alertPanel').empty();
            $('#alertPanel').fadeIn(100);
        }
    );
   }
   else{
        $('#alertPanel').empty();
   }
    // noinspection JSJQueryEfficiency

}

function showAlert(type,message, clearPrev = false, timeout = alertTimeout){
    if(clearPrev){
        clearAlerts();
    }
     //Show alert
    let alert = $('<div></div>')
        .addClass('alert')
        .addClass('alert-'+type)
        .text(message)
        .attr('role','alert');
    $('#alertPanel')
        .append(alert);

     setTimeout(() => clearAlerts(true), timeout);
}

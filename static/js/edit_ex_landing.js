let mExperiment = null;
let MAX_EX_NAME_CHARS = 50;
let MIN_EX_NAME_CHARS = 3;
let busy = false;


onInit();


function onInit(){
    disableButtons();
    loadExperimentAsync();
}

function onAttach(){
    //Ex loaded
    $('#exNameEntry').val(mExperiment.name);
    setNameLabel(mExperiment.name);
    enableButtons();
}

function onUpdate(){
    enableButtons();
    setNameLabel(mExperiment.name);
}

function loadExperimentAsync(){
    url = `${BASE_URL}/api/experiments/${data_ex_id_ex_landing}`;
    axios.get(url)
        .then( (res) =>{
            if(res.data.status){
                if(res.data.status === 'ok'){
                    //good
                    //good
                    console.log('Got experiment');
                    mExperiment = {
                        'name': res.data.items.name,
                        'exId': res.data.items.exId,
                        'creator': res.data.items.creator,
                    };
                    onAttach();
                }
            }
        })
        .catch( (err) => {
            console.error('Failed loading experiment ' + err.message);
            alert('Failed loading experiment')
        })
}
function updateNameAsync(event){
    if(event){
        event.preventDefault();
    }
    if(!mExperiment){
        console.warn('Not loaded yet. What are you doing, trying to break me?');
        return;
    }
    disableButtons();
    let url = `${BASE_URL}/api/experiment/setname`;
    let data = new FormData();
    data.append('uid', mExperiment.creator);
    data.append('exId', data_ex_id_ex_landing);
    let name = $('#exNameEntry').val();
    if(name.length < MIN_EX_NAME_CHARS){
        alert('Name is too short, must be at least ' + MIN_EX_NAME_CHARS + ' characters.');
        enableButtons();
        return
    }
    if(name.length > MAX_EX_NAME_CHARS){
        alert('Name is too long, must be shorter than  ' + MAX_EX_NAME_CHARS + ' characters.');
        enableButtons();
        return
    }
    if(name.toLowerCase().match(/^[a-z0-9\\d\\-_\s]+$/i)){
      //G2G
    }
    else{
      //Invalid
        alert('Invalid characters entered. Can only use 0-9, a-z, A-Z!');
        enableButtons();
        return
    }
    data.append('name', name);

    axios.post(url, data).then((res) =>{
        if(res.data){
            if(res.data.status){
                if(res.data.status !== 'ok'){
                    console.error(res.data.message);
                    throw 'Update failed'
                }
                else{
                    updating = false;
                    mExperiment.name = name;
                    onUpdate();
                }
            }
        }
    })
        .catch((err) =>{
            console.error('Failed update!');
            updating = false;
            alert('Failed to change name!');
            enableButtons();
        })
}

function setNameLabel(newContent){
    $('#exNameDisplay').text(newContent)
}


function enableButtons(){
    $('#nameUpdateButton').prop('disabled',false);
    $('#nameUpdateButton').text('Update Name');

    $('#editStimsetButton').prop('disabled',false);
    $('#editBoardButton').prop('disabled',false);
}

function disableButtons(){
    $('#nameUpdateButton').text('Busy...');
    $('#nameUpdateButton').prop('disabled',true);
    $('#editStimsetButton').prop('disabled',true);
    $('#editBoardButton').prop('disabled',true);
}


function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function handleUserRemovesExperiment() {
    if(busy){
        console.warn('Already busy!');
        return;
    }
    busy = true;
    let ok = confirm('Are you sure you want to delete this experiment?');
    if(ok) {
        let url = `${BASE_URL}/api/experiment/remove`;
        data = new FormData();
        data.append('uid', USER_ID);
        data.append('exId', data_ex_id_ex_landing);


        axios.post(url, data).then( (res) =>{
            if(res.data){
                if(res.data.status){
                    if(res.data.status !== 'ok'){
                        console.error(res.data.message);
                        alert(
                            '(alert) Failed to delete experiment! msg:? ' + res.data.message
                        );
                        busy = true;
                    }
                    else{
                        window.location.replace(`${BASE_URL}/home/`);
                    }
                }
            }
        }).catch( (err) =>{
            console.debug(err);
             alert(
                 '(catch) Failed to delete experiment! msg:?' + err
             )
            busy = false;
        })
    } else {
        busy = false;
        return;
    }
}

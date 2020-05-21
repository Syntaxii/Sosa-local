//file globals

let dataPackage = null;
//Lifecycle methods
onInit(DATA_STRING);

function onInit(data64){
//GSU 131
    console.debug('Processing data...');
    let data = base64_url_decode(data64);
    dataPackage = JSON.parse(data);
    console.debug('Init ex scene');
    //Init the scene actually utilizing the parameters...
    initExperimentScene(false, safeJsonParse(dataPackage.config.locks), {
        shouldHideBgImage: dataPackage.config.shouldHideBgImage,
        shouldHideStimLabels: dataPackage.config.shouldHideStimLabels,
        shouldHidePreview: dataPackage.config.shouldHidePreview,
    });
    onAttach();
}

function onUsedStimClicked(){
    //Called when a user clicks an already in scene stim.
    console.debug('User clicked used stim...Ignoring...');
    showAlert('warning', "You've already placed this stim!", true);
}


function confirmParticipation() {
    //GSU 119
    /*
    not sure if this is needed here....
     */
}

function onAttach() {
    //GSU 132

    if(!_getBoard()){
         alert('Failed to parse experiment data, please alert your experiment admin!');
        console.error('Cannot load experiment with no board!');
        return;
    }
    //Set the board using the preview widget setBoard function.
    setBoard(_getBoard(), dataPackage.config);
    loadStims();


}

function loadStims() {
    //GSU 133
    //if there are no stims in the ex for some reason?
    if(!_getStims() || _getStims().length === 0){
        alert('Failed to parse experiment data, please alert your experiment admin!');
        console.error('Cannot load experiment with zero stims!');
        return;
    }
    let orderInfo;
    //figure out if we need to use the fallback list or not
    if(dataPackage.config.currentPresentationOrder.replace){
        orderInfo = safeJsonParse(dataPackage.config.currentPresentationOrder);
    }
    else if (dataPackage.config.currentPresentationOrder.fallbackOrder){
        orderInfo = dataPackage.config.currentPresentationOrder
    }
    if(_doesOrderExist(orderInfo.orderName, _getStims()[0])) {
        let orderedStims = _orderStims(orderInfo.orderName, _getStims());
        _addStimsToGui(orderedStims);
    }
    else{
        //use backup
        console.warn('Detected deleted order, falling back!');
        let fallbackStimList = orderInfo.fallbackOrder;
        _addStimsToGui(fallbackStimList);
    }
}

/*
    Should call add stim.
 */
function handleOnStimClick(stim, stimLi) {
    //GSU 134
    addStimToBoard(stimLi, stim);
    //I'm already checking for duplicates in the widget automatically usingthe scene graph
    //Still remove the click because good practice
    $(stimLi).click(onUsedStimClicked);
    //Style it up
    $(stimLi).addClass('stim-li-used');
     $(stimLi).removeClass('stim-li');
}

function onExperimentFinished() {
    //GSU 135
    if(!_experimentIsComplete()){
        showAlert('danger', "Your experiment is not complete, check that you've placed all stims!", true);
        return;
    }
    /*
        todo: Gather stats, execute flow that stores the results and notifies the researcher! Don't forget to expire the invite. You'll also need to render the grid and take a snapshot of the board
        todo: implement takeSnapshot()
     */

    //Only getting endTime for now
    dataPackage.tracking.endTime = Date.now();
    finalDataString = base64_url_encode(JSON.stringify(dataPackage));
    console.warn('End of implementation!');
    //advance to completion page
    window.location.replace('/subject/pres/complete/'+finalDataString)
}

//Utility
function _getBoard(){
    return dataPackage.exData.board;
}
function _getStims(){
    return dataPackage.exData.stims;
}
//useful to get full data for a certain clicked stim.
function _getStimById(stimId){
    let stim = null;

    _getStims().forEach(
        (currentStim) =>{
            if(!stim){
                //We need to go back and normalize everything to either be camelcase or not eventually
                //Sorry just hadnt got the chance to refactor the old team's models. We should be using camelCase.
                if(currentStim.stimid === stimId){
                    //found it
                    stim = currentStim;
                }
            }
        }
    );

    if(!stim){
        console.err('Was unable to find stim with id ' + stimId + '!');
        return null;
    }
    return stim;
}
function _addStimsToGui(stims){
     //Empty gui list
        $('#stimlist').empty();
        //itr through stims in order
        stims.forEach(stim =>{
            let orderIndex = JSON.parse(stim.orders)[this.currentOrder];
            //build li element
            let stimLi = $('<li></li>')
                .text(stim.stimlabel)
                .addClass('stim-li')
                .addClass('list-group-item')
                //Ensure you attach the approriate order
                .attr('data-index', orderIndex )
                //todo: As mentioned earlier, we need to refactor all lowercase model fields to camelcase ones!
                .attr('data-stimId', stim.stimid ) //here's why we use camelCase data-stimId vs data-stim-id
                .click(() => handleOnStimClick(stim, stimLi));
            //Add to list.
            $('#stimlist').append(stimLi);
        });

        console.debug('Added stims to list!');
}
function _doesOrderExist( orderName, stim){
    return orderName in safeJsonParse(stim.orders)
}
function _orderStims(orderName, stims){
        return stims.sort(
            function(a,b){
                //Get order list for a and b
                let aOrd = JSON.parse(a.orders);
                let bOrd = JSON.parse(b.orders);

                //let aOrd = a.orders; // these two lines are for testing, when you declare dummy data it wont be in JSON.
                //let bOrd = b.orders;
                //Return a-b to sort asc
                return aOrd[orderName] - bOrd[orderName]

            }
        )
}
function _experimentIsComplete(){
    let unused = $('.stim-li').length;
    return unused === 0;
}

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
function showAlert(type,message, clearPrev = false, timeout = 1500){
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

/*
~marcus
 */

//constants
//todo: may be a bug on this screen when trying to load an experiment with NO STIMS!
LENGTH_INFINITE = 400000000; //Used for showalerts

let configId = null;
let alertTimeout = 1500;
let MIN_CONFIG_NAME_CHARS = 3;
let MAX_CONFIG_NAME_CHARS = 50;
//Global Data models
let mExData,mConfig, mConfigCache, mPreviewImageUrl = null, mCurrentLoadedConfigName = '';
//Global UI State [Selected names, etc]
let mSelectedOrderName;

let busy = false;
let showing = false;
let listLoading = true;
let configLoaded = false; //True when the user is working on a named configuration
let saveUpToDate = false; //should be marked false whenever user changes any state, such as current otder, etc
//Call init after doc load
$(document).ready(onInit);

function onInit() {
    initSliderStyles();
    console.log(EX_ID.length);
    if(!EX_ID || EX_ID.length !== 39){
        showAlert('warning','Invalid Experiment Id in Url!', true, LENGTH_INFINITE);
        onLoadError();
        return;
    }

    $('#exConfigPickerWidget').hide(0);
    loadExperiment();
}
function initSliderStyles(){
    //Inits the value popup on our sliders
    let $range = $('.js-input-range');

    if( $range.length ) {

        let rangeTooltip = function (event) {
            $(this).attr( "data-value", $(this).val() );
        };

        $range.on( 'change', rangeTooltip );
        //show value
        $range.each(
            (idx,slider) =>{
                  $(slider).attr( "data-value", $(slider).val() );
            }
        )
    }
}
function onPostRender(exData){
    //first, store data
    mExData = exData;
    if(!mExData){
        console.error('No loaded dataPackage, Aborting load...');
        return;
    }
    //Here, we want to initialize the rest of the UI.
    //I'm choosing to split off here as this is the first major 'load checkpoint'
    //The rest of the UI is really just using jQuery to set values, pretty standard and fast
    //Define procedures
    let fillStimlist = () => {

        mExData.stims.forEach(
            (stim) => attachStimToList(stim)
        )
    };
    let fillOrderlist = () => {
        let orders = JSON.parse(mExData.stims[0].orders);
        let orderNames = Object.keys(orders);

       orderNames.forEach(
           (orderName) => {
               let  orderListItem = $(`<li>${orderName}</li>`)
                               .addClass('list-group-item')
                               .addClass('sosa-clickable-list-item')
                               .click(() =>{
                                   select(getEventTarget(event));
                                   updateStimlistOrderGUI(orderName)
                           });
               $('#orderlist')
                   .append(
                       orderListItem
                    );
               if(orderName === orderNames[0]){
                   select(orderListItem);
                   updateStimlistOrderGUI(orderName);
               }




           }
       );

    };

    //Execute tasks
    fillStimlist();
    fillOrderlist();

    //Call last lifecycle metho
    onAttach();

}
function onAttach(){
     showAlert('info','Finished...',true, 1500)

}
function onLoadError(){

}
//Body methods
function loadExperiment(){
 let url = `${BASE_URL}/api/experiment/package/${EX_ID}`;
    axios.get(url).then(
        (request) =>{
            if(request.data.status === 'err'){
                alert("Could not load experiment! Please try again later.\n");

                //Redirect to the load experiment screen
                if(!DEBUG_MODE) {
                    window.location.replace(`${BASE_URL}/experiment/${EX_ID}`);
                }
                else{
                    console.error('Failed loading experiment: ' + request.data.message)
                }
                return;
            }
            if(request.data.items){
                console.debug('Got items for experiment!');
                //exPreviewWidget.js methods
                initExperimentScene(true);
                setBoard(request.data.items.board);
                addStimsToBoard(request.data.items.stims);
                //execute post render tasks
                onPostRender(request.data.items);
                onAttach();
            }
            else{
                //todo: replace alert() calls with a better more user friendly way.
                alert("Could not load experiment! Please try again later. \n");
                //Redirect to the load experiment screen
                if(!DEBUG_MODE)
                    window.location.replace(`${BASE_URL}/experiment/${EX_ID}`);
            }
        }
    ).catch(
        (err) =>{
            //todo: replace alerts
            showAlert('error', `Failed to load experiment. msg: ${err}`,true,50000);
        }
    )
}
function handleUserSavesConfig(){
    saveConfig(
        (configData, configId) => {
            if(!configId){
                console.error('returned no configId');
                return;
            }
            console.debug(configId + ' saved config id.');
            mConfig.configId = configId
        }
    )
}
function saveConfig(then = null){
    let buildPresentationOrderBundle = () => {
         let getListInOrder = function(orderName){
        return mExData.stims.sort(
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

    };
        //Collect the corrently selected order, store into object
        return {
          orderName: mSelectedOrderName, //Always attempt to sort by this order first
          fallbackOrder: getListInOrder(mSelectedOrderName),
      };
    };


    let name = prompt('Please enter a name!', mCurrentLoadedConfigName);
    if(!name || !sanitizeText(name)){
        toggleGreyScreen();
        return;
    }
    //Set the saving flag, so that we can deny spams
    saving = true;
    $('#saveConfigButton').text('Saving...');
    //Prompt the user
    showAlert('info','Saving config: ' + name, true, 50000);
    //The names passed to getVal should match the ids given to the elements
    let configData = {
        //Config id will either be undefined, or attached afterwards
        exConfigName: name,
        experimentId: EX_ID,

        currentPresentationOrder : JSON.stringify(buildPresentationOrderBundle()),
        locks: JSON.stringify(
            {
                tilt: getVal('lockTilt'),
                rotation: getVal('lockRotation'),
                zoom: getVal('lockZoom'),
            }
        ),

        gridSize: getGridSize(),

        boardTintOpacity: getVal('boardTintOpacity'),
        boardTintR: getVal('boardTintR'),
        boardTintG: getVal('boardTintG'),
        boardTintB: getVal('boardTintB'),

        previewImageUrl: mPreviewImageUrl,

        shouldHidePreview : getChecked('shouldHidePreview'),
        shouldHideBgImage : getChecked('shouldHideBgImage'),
        shouldHideStimLabels : getChecked('shouldHideStimLabels'),
    };

    if(mConfig){
        if(mConfig.exConfigId){
            configData['exConfigId'] = mConfig.exConfigId
        }
    }


    let data = new FormData();
    data.append('exConfig', JSON.stringify(configData));
    data.append('uid', window.USER_ID);
    data.append('exId', EX_ID);


    let url = `${BASE_URL}/api/experiment/configs`;
    axios.post(url,data).then(
        (res) => {
            if(res.data.status !== 'ok') {
                //Failed to save, show message to alert the user;
                showAlert('warning', 'Was unable to save the configuration',true, '2000');
                console.error('failed to save user configuration ' + res.data.message);
                saving = false;
                toggleGreyScreen(false);
                $('#saveConfigButton').text('Save Configuration');
            }
            else{
                showAlert('info','Finished saving configuration: ' + name);
                saving = false;
                setWorkingConfig(configData);
                saveUpToDate = true;

                configId = res.data.exConfigId;
                if(!configId){
                    console.warn('Was unable to retrieve configId');
                }

                if(then){
                    console.debug('Running callback');
                    then(configData,configId)
                }
                $('#saveConfigButton').text('Save Configuration');
                toggleGreyScreen(false);
            }

        }
    ).catch(
        (err) =>{
            showAlert('danger', 'Failed to save configuration, please try again later! ', true, 5000);
            console.debug(err);
            toggleGreyScreen(false);
        }
    )



}
function setWorkingConfig(config, updateGui = false){
    mConfig = config;
    mCurrentLoadedConfigName = config.exConfigName;
    $('#displayConfigName')
        .text(`${mCurrentLoadedConfigName}`);
    //This will always reset the saveUpToDate state, as we've just loaded a new config
    saveUpToDate = true;
    configLoaded = true;

    if(updateGui){
        setGuiConfigValues(config);
    }
}
/*
    Called when the user clicks a config, and set workingconfig is called with updateGui = true
 */
function setGuiConfigValues(config){

        //Config id will either be undefined, or attached afterwards
        setVal('gridSize', config.gridSize);

        setVal('boardTintOpacity', config.boardTintOpacity);
        setVal('boardTintR', config.boardTintR);
        setVal('boardTintG', config.boardTintG);
        setVal('boardTintB', config.boardTintB);


        setChecked('shouldHidePreview', config.shouldHidePreview);
        setChecked('shouldHideBgImage', config.shouldHideBgImage);
        setChecked('shouldHideStimLabels', config.shouldHideStimLabels);

        //Set radio
        let $radios = $('input:radio[name=gridSize]');
        $radios.filter(`[value=${config.gridNumber}]`).prop('checked', true);


        initSliderStyles();
        updateRender();
}
function updateRender(){
    updateBoardTintRGB();
    updateBoardTintOpacity();
     //Mark as modifed
     saveUpToDate = false;
}
function updateBoardTintRGB(){
    setBoardTintRGB(
        getVal('boardTintR'),
        getVal('boardTintG'),
        getVal('boardTintB'),
    );
     //Mark as modifed
     saveUpToDate = false;
}
function updateBoardTintOpacity(){
    setBoardTintStrength(
        getVal('boardTintOpacity')
    );
     //Mark as modifed
     saveUpToDate = false;
}
function updateCheckBoxOptionRenders(){
    /*
    todo: implement the checkboxs, so that they actually update the GUI
    For now they only save their value to the config!
     */
}
//For order list
function updateStimlistOrderGUI(withSelectedOrder){
    if(withSelectedOrder === this.mSelectedOrderName){
        console.warn('Already selected this order!');
        return;
    }
    /*
        checks if valid ordername
        pulls list of stims from mExData
        Sorts the list with given ordername
        Uses jquery to render the list
        saves the currently selected order (the one that called this method)
     */
    let getListInOrder = function(orderName){
        return mExData.stims.sort(
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

    };

    let orders = JSON.parse(mExData.stims[0].orders);
    if(!(withSelectedOrder in orders)) {
        console.error(
            'Invalid order name was passed. ' +
            `given: ${withSelectedOrder} possible: ${Object.keys(orders)}`
        )
    }
    else{
        let sorted = getListInOrder(withSelectedOrder);

        //Clear old stimlist
        $('#stimlist').empty();
        //Display new stimlist
        sorted.forEach(
            (stim) => attachStimToList(stim)
        );

        mSelectedOrderName = withSelectedOrder;
        //Def a hack here to clear everything off the board. todo: fix this hack, somehow, it misses everything else
        clearBoard();
        clearBoard();
        clearBoard();
        clearBoard();
        resetTrackers();
        //End hack

        //Rerender the new stim order
        addStimsToBoard(sorted);
    }

    //Mark as modifed
     saveUpToDate = false;





}
//End
//For exConfig picker widget
function loadConfigsForExperiment(){
    disableWidgetUI();
    listLoading = true;
    let url = `${BASE_URL}/api/experiment/configs/${EX_ID}`;
    //api/experiment/configs/<exId>
    axios.get(url).then(
        (res) =>{
            if(!res.data.items){
                showWidgetAlert('warning','Was unable to load from server! Check connection?');
                if(res.data.message){
                    console.error('Failed to load configs: ' + res.data.message);
                }
                enableWidgetUI();
                listLoading = false;
                return;
            }
            if(res.data.items.length === 0){
                showWidgetAlert('warning',`Couldn't find any configurations for this experiment!`);
                enableWidgetUI();
                listLoading = false;
                return;
            }
            mConfigCache = res.data.items;
            displayConfigs(mConfigCache);
            //Prompt user on completion
            showWidgetAlert('info','Finished...',true,1500);
            listLoading = false;
            enableWidgetUI()
        }
    ).catch(
        (err) =>{
            showWidgetAlert('error','Was unable to load from server! Check connection?',true,5000);
            console.error('Was unable to load configs: ' + err);
            listLoading = false;
            enableWidgetUI()
        }
    )
}
function handleUserSelectsConfig(configId){
     // (replace the list or overlay it with an animated loading message)
    $('#exConfigPickerWidget').hide(1000);

    let url = `${BASE_URL}/api/configs/${configId}`;
    axios.get(url).then(
        (res) =>{
            if(res.data.status !== 'ok'){
                showWidgetAlert('warning','Was unable to load from server! Check connection?');
                if(res.data.message){
                    console.error('Failed to load configs: ' + res.data.message);
                }
            }
            else{
                this.configId = configId;
                setWorkingConfig(res.data.config, true);
                 // (replace the list or overlay it with an animated loading message)
                $('#exConfigPickerWidgetBg').hide(1000);

            }
        }
    )
}
function displayConfigs(configs){
    $('#exConfigPickerWidgetList').empty();
    configs.forEach(
                (configInfo) =>{
                    let $div = $('<div>').addClass('widgetDiv');
                    let closeButton = $('<button>')
                        .text('X')
                        .addClass('close-button')
                        .addClass('btn').addClass('btn-danger')
                        .click(
                            () =>{
                                if(busy){
                                    alert('Already busy!');
                                    return
                                }
                                busy = true;

                                let url = `${BASE_URL}/api/config/delete`;
                                let data = new FormData();

                                data.append('configId', configInfo.configId);
                                data.append('exId', EX_ID);
                                data.append('userId', USER_ID);

                                axios.post(url,data).then(
                                    (res) =>{
                                        handleUserRequestsRefresh();
                                        busy = false;
                                    }
                                ).catch(
                                    (err) => {
                                        console.error('Failed to delete exConfig : msg?:' + err);
                                        busy = false;
                                    }
                                )

                            }
                        )
                    ;


                    let el = $('<li>')
                        .text(configInfo.configName)
                        .click(
                            () =>{
                                widgetSelect(el);
                                handleUserSelectsConfig(configInfo.configId);
                            }
                        )
                        .addClass('list-group-item')
                        .addClass('sosa-widget-selectable')
                        .data('data-config-id', configInfo.configId)
                        .append();

                    $div.append(el);
                    $div.append(closeButton);
                    $('#exConfigPickerWidgetList').append($div);
                }
            );
}

function beginExperimentStaging(){
     toggleGreyScreen(true,1);
    if(!configLoaded){

        saveConfig(
            (data,configId) =>{
                window.location.href = '/experiment/invite/'+ configId
            }
        )
    }
    else{
        let ok = confirm('Would you like to save first?');
        if(ok){
             saveConfig(
            (data,configId) =>{
                window.location.href = '/experiment/invite/'+ configId
            }
        );
        }
        else{
            toggleGreyScreen(true);
            window.location.href = '/experiment/invite/'+ mConfig.configId //fixed null config id
        }
    }
}

/**
 * Called when user attempts to refresh the config widget.
 */
function handleUserRequestsRefresh(){
    //for exConfigPicker refresh
    if(listLoading){
        console.warn('Already loading!');
        return;
    }
    showWidgetAlert('info','Loading configurations...',true,50000000);
    loadConfigsForExperiment();
}

function clearList(){
    $('#exConfigPickerWidgetList').empty();
}

function handleUserSearch(inputTarget){
    if(!mConfigCache){
        return;
    }
    let userVal = $(inputTarget).val().toLowerCase();
    if(userVal.length === 0){
        clearList();
        displayConfigs(mConfigCache);
        return;
    }
    let results = mConfigCache.filter(
        (exConfig) => {
            return exConfig.configName.toLowerCase().includes(userVal);
        }
    );
    displayConfigs(results);

}

function toggleConfigPicker() {
    if(showing){
        hideOverlay();
        showing = false;
    }
    else{
        if(!mConfigCache){
            loadConfigsForExperiment();
        }
        showOverlay();
        showing = true;
    }
}

function hideOverlay(time=1000) {
                    $('#exConfigPickerWidgetBg').hide(time);
                    $('#exConfigPickerWidget').hide(time);
                }
function showOverlay(time=250) {
    $('#exConfigPickerWidgetBg').show(time);
    $('#exConfigPickerWidget').show(time);
}
function toggleGreyScreen(onbool,time=500) {
    if(onbool)
        $('#exConfigPickerWidgetBg').show(time);
    else{
        //Fixed this so that it is actually toggleable
        $('#exConfigPickerWidgetBg').hide(time);
    }
}

/*
    Exconfig picker widget methods end here

 */


//Util
/*
    This method currently targets ALL ELEMENTS WITH THE ACTIVE CLASS
    this means you could get wierd glithces if you have more than one list that needs to
    work with selection.
 */
function resetSelection(){
     let activeItems = document.getElementsByClassName('active');
            let i = 0;
            for(i; i < activeItems.length;i++) {
                activeItems[i].classList.remove('active');
            }
}
function select(el){
    //See comment on this method!
    resetSelection();
    $(el).addClass('active')
}
function attachStimToList(stim){
    $('#stimlist')
                    .append(
                        $(`<li>${stim.stimlabel}</li>`)
                            .addClass('list-group-item')
                    );
}
function clearAlerts(fadeOut = false){
    // noinspection JSJQueryEfficiency
   if(fadeOut){
        $('#alertPanel').fadeOut(
        1500, () =>{
            $('#alertPanel').empty();
            //$('#alertPanel').fadeIn(100);
        }
    );
   }
   else{
        $('#alertPanel').empty();
   }
    // noinspection JSJQueryEfficiency

}
function clearWidgetAlerts(fadeOut = false){
    // noinspection JSJQueryEfficiency
   if(fadeOut){
        $('#exConfigPickerWidgetAlertPanel').fadeOut(
        1500, () =>{
            $('#exConfigPickerWidgetAlertPanel').empty();
            //$('#alertPanel').fadeIn(100);
        }
    );
   }
   else{
        $('#exConfigPickerWidgetAlertPanel').empty();
   }
    // noinspection JSJQueryEfficiency

}
function showAlert(type,message, clearPrev = false, timeout = alertTimeout){
    if(clearPrev){
        clearAlerts();
    }

    let alert = $('<div></div>')
        .addClass('alert')
        .addClass('alert-'+type)
        .text(message)
        .attr('role','alert');
     //Show alert
    $('#alertPanel')
        .append(alert);

     setTimeout(() => clearAlerts(true), timeout);
}
function showWidgetAlert(type,message, clearPrev = false, timeout = alertTimeout){
    if(clearPrev){
        clearWidgetAlerts();
    }
     //Show alert
    $('#exConfigPickerWidgetAlertPanel')
        .append('<div></div>')
        .addClass('alert')
        .addClass('alert-'+type)
        .text(message)
        .attr('role','alert');

     setTimeout(() => clearWidgetAlerts(true), timeout);
}
function handleBackButton(){
    window.location.replace(`/experiment/${EX_ID}`);
}



function resetWidgetSelection(){
     let activeStims = document.querySelectorAll('.active,.sosa-widget-selectable');
            let i = 0;
            for(i; i < activeStims.length;i++) {
                activeStims[i].classList.remove('active');
            }
}
function widgetSelect(el){
    resetWidgetSelection();
    $(el).addClass('active')
}
function sanitizeText(text){
     if(text.length < MIN_CONFIG_NAME_CHARS){
        alert('Name is too short, must be at least ' + MIN_CONFIG_NAME_CHARS + ' characters.');
        return
    }
    if(text.length > MAX_CONFIG_NAME_CHARS){
        alert('Name is too long, must be shorter than  ' + MAX_CONFIG_NAME_CHARS + ' characters.');
        return
    }
    if(text.toLowerCase().match(/^[a-zA-Z0-9\\d\\-_\s]+$/i)){
      //G2G
        return true;
    }
    else{
      //Invalid
        alert('Invalid characters entered. Can only use 0-9, a-z, A-Z!');
        return false;
    }
}
function enableWidgetUI(){
    $('#exConfigPickerWidgetRefreshButton').prop('disabled',false);
}
function disableWidgetUI(){
    $('#exConfigPickerWidgetRefreshButton').prop('disabled',true);
}

function getVal(idSelector){
    return $('#'+idSelector).val() ?
        $('#'+idSelector).val() : null;
}
function getChecked(checkboxId){
    let checkbox = $('#'+checkboxId);
    return checkbox.prop("checked");
}
function getGridSize(){
    return $("input[name='gridSize']:checked").val()
}
function setVal(idSelector,val){
    $('#'+idSelector).val(val)
}
function setChecked(checkboxId,isChecked){
    let checkbox = $('#'+checkboxId);
    checkbox.prop("checked", isChecked);
    //!checkbox.prop("checked")
}


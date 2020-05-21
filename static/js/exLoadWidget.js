let loading = true;
let showing = false;
let firstLoad = true;
let experimentCache = [];

function handleUserRequestsRefresh(){
    if(loading){
        console.warn('Already loading!');
        return;
    }
    showAlert('info','Loading your experiments...',true,50000000);
    onInit();
}
function handleUserSearch(inputTarget){
    let userVal = $(inputTarget).val().toLowerCase();
    if(userVal.length === 0){
        clearList();
        displayExperiments(experimentCache);
        return;
    }
    let results = experimentCache.filter(
        (ex) => {
            return ex.exName.toLowerCase().includes(userVal);
        }
    );
    displayExperiments(results);

}
function toggleWidgetIsShowing(){
    if(firstLoad){
        onInit();
        firstLoad = false;
    }

    if(!showing){
        showOverlay();
        showing=true;
    }
    else{
        hideOverlay();
        showing = false;
    }
}

function onInit() {

    if(!USER_ID){
        console.error('USER_ID is not set in scope. ExperimentLoader cannot continue.');
        return;
    }


    let loadExperimentsAsync = () =>{
        let url = `${BASE_URL}/api/experiments/user/${USER_ID}`;
        axios.get(url)
            .then((response) =>{
                if(response.data.items.length === 0){
                    onUserHasNoExperiments();
                    return;
                }
                experimentCache = response.data.items;
                displayExperiments(experimentCache);
                loading = false;
                showAlert('info','Finished',true,500);
                enableUi();

            })
            .catch((err) =>{
                console.error('Failed to retrieve experiments! '+ err);

                showAlert('error','Was unable to load, click to try again!',
                    true,50000000, onInit);
                enableUi();
            })
    };

    disableUi();
    loadExperimentsAsync();

}
function onUserHasNoExperiments(){
    //todo: prompt user here
    showAlert('info','You have no experiments, click to reload!',
                    true,50000000, onInit)
}
function onExperimentClicked(option, params = null){
    switch(option){
        case 'load':
            //Confirm?
            let ok = confirm('Select this one?');
            if(!ok){
                return;
            }

            //todo: replace this with some sort of loading splash screen in the future.
            //We could also possibly do some animated text
            // (replace the list or overlay it with an animated loading message)
            $('#exLoadWidget').hide(1000);

            window.location.href = BASE_URL + '/experiment/'+params;
            break;
        case 'template':
            let ok2 = confirm('Continuing will overwrite your current experiment! Are you sure?');
            if(!ok2){
                return;
            }


            //todo: replace this with some sort of loading splash screen in the future.
            //We could also possibly do some animated text
                // (replace the list or overlay it with an animated loading message)
                $('#exLoadWidget').hide(1000);

            let url = `${BASE_URL}/api/experiment/template`;
            let data = new FormData();
            data.append('templateEx', params);
            data.append('baseEx', data_ex_id_ex_landing);
            data.append('uid', USER_ID);

            axios.post(
                url, data
            ).then(toggleWidgetIsShowing)
                .catch((err) =>{
                    showAlert('warning', 'Was unable to load template! ' + err, true, 5000, toggleWidgetIsShowing)
                });
            break;
        default:
            console.error('ExLoadWidget is unable to process option: ' + option)
    }
}

//Utils
function disableUi(){
    $('#exLoadWidgetRefreshButton').attr('disabled', true);
}
function enableUi(){
    $('#exLoadWidgetRefreshButton').attr('disabled', false);
}

function clearList(){
    $('#exLoadWidgetList').empty();
}
function displayExperiments(exList){
        clearList();
        exList.forEach( (experiment) => {

                    console.log(Object.keys(experiment));
                    // noinspection JSUnfilteredForInLoop
                    let el = $('<li></li>')
                        .text(experiment.exName)
                        .data('data-exId', experiment.exId)
                        .addClass('list-group-item')
                        .click(() =>{
                            select(el);
                            //remember to set SELECT_OPTION in your containing html page...
                            onExperimentClicked(SELECT_OPTION, experiment.exId)
                        });
                    $('#exLoadWidgetList').
                        append(el)
                });
}

function hideOverlay(time=1000) {
                    $('#exLoadWidgetBg').hide(time);
                    $('#exLoadWidget').hide(time);
                }
function showOverlay(time=1000) {
    $('#exLoadWidgetBg').show(time);
    $('#exLoadWidget').show(time);
}

function resetSelection(){
     let activeStims = document.getElementsByClassName('active');
            let i = 0;
            for(i; i < activeStims.length;i++) {
                activeStims[i].classList.remove('active');
            }
}
function select(el){
    resetSelection();
    $(el).addClass('active')
}

function clearAlerts(fadeOut = false){
    // noinspection JSJQueryEfficiency
   if(fadeOut){
        $('#exLoadWidgetAlertPanel').fadeOut(
        1500, () =>{
            $('#exLoadWidgetAlertPanel').empty();
            $('#exLoadWidgetAlertPanel').fadeIn(100);
        }
    );
   }
   else{
        $('#exLoadWidgetAlertPanel').empty();
   }
    // noinspection JSJQueryEfficiency

}
function showAlert(type,message, clearPrev = false, timeout = 1500, click = null){
    if(clearPrev){
        clearAlerts();
    }
     //Show alert
    let alert = $('<div></div>')
        .addClass('alert')
        .addClass('alert-'+type)
        .text(message)
        .attr('role','alert');
    if(click){
        $(alert).click(() =>{
            clearAlerts();
            click()
        })
    }
    $('#exLoadWidgetAlertPanel')
        .append(alert);

     setTimeout(() => clearAlerts(true), timeout);
}




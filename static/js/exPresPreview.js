let invId = $('#data').attr('data-inv-id');
let invite = null;
let config = null;
/*
    Example dataPackage
        "experimentId": "ex-c69f8ac6-6bfa-4d35-9a5b-b148f58309db",
        "experimentName": "Orders Here",
        "stims": [
            {
                "stimid": 54,
                "stimr": 150,
                "stimg": 0,
                "stimb": 0,
                "stimlabel": "Stim 3",
                "labelr": 0,
                "labelg": 0,
                "labelb": 0,
                "stimshape": "Cylinder",
                "stimsetid": "sts-959a2ae4-f6b5-4145-afd2-dbdba3a3345b",
                "orders": "{\"Order 1\":3,\"Order 2\":3,\"Order 3\":0}",
                "imageUrl": "''"
            },
            {
                "stimid": 52,
                "stimr": 94,
                "stimg": 183,
                "stimb": 82,
                "stimlabel": "Stim 5",
                "labelr": 0,
                "labelg": 0,
                "labelb": 0,
                "stimshape": "Cylinder",
                "stimsetid": "sts-959a2ae4-f6b5-4145-afd2-dbdba3a3345b",
                "orders": "{\"Order 1\":1,\"Order 2\":0,\"Order 3\":1}",
                "imageUrl": "''"
            },
            {
                "stimid": 56,
                "stimr": 30,
                "stimg": 79,
                "stimb": 105,
                "stimlabel": "Stim 1",
                "labelr": 0,
                "labelg": 0,
                "labelb": 0,
                "stimshape": "Cone",
                "stimsetid": "sts-959a2ae4-f6b5-4145-afd2-dbdba3a3345b",
                "orders": "{\"Order 1\":0,\"Order 2\":4,\"Order 3\":2}",
                "imageUrl": "''"
            },
            {
                "stimid": 55,
                "stimr": 150,
                "stimg": 0,
                "stimb": 0,
                "stimlabel": "Stim 2",
                "labelr": 0,
                "labelg": 0,
                "labelb": 0,
                "stimshape": "Cylinder",
                "stimsetid": "sts-959a2ae4-f6b5-4145-afd2-dbdba3a3345b",
                "orders": "{\"Order 1\":2,\"Order 2\":2,\"Order 3\":3}",
                "imageUrl": "''"
            },
            {
                "stimid": 53,
                "stimr": 150,
                "stimg": 146,
                "stimb": 82,
                "stimlabel": "HMMMMMMMM",
                "labelr": 0,
                "labelg": 0,
                "labelb": 0,
                "stimshape": "Cylinder",
                "stimsetid": "sts-959a2ae4-f6b5-4145-afd2-dbdba3a3345b",
                "orders": "{\"Order 1\":4,\"Order 2\":1,\"Order 3\":4}",
                "imageUrl": "''"
            },
            {
                "stimid": 51,
                "stimr": 150,
                "stimg": 0,
                "stimb": 0,
                "stimlabel": "Stim 6",
                "labelr": 0,
                "labelg": 0,
                "labelb": 0,
                "stimshape": "Cylinder",
                "stimsetid": "sts-959a2ae4-f6b5-4145-afd2-dbdba3a3345b",
                "orders": "{\"Order 1\":5,\"Order 2\":5,\"Order 3\":5}",
                "imageUrl": "''"
            },
            {
                "stimid": 50,
                "stimr": 150,
                "stimg": 0,
                "stimb": 0,
                "stimlabel": "Stim 7",
                "labelr": 0,
                "labelg": 0,
                "labelb": 0,
                "stimshape": "Cylinder",
                "stimsetid": "sts-959a2ae4-f6b5-4145-afd2-dbdba3a3345b",
                "orders": "{\"Order 1\":6,\"Order 2\":6,\"Order 3\":6}",
                "imageUrl": "''"
            }
        ],
        "board": {
            "boardid": "brd-493889fb-2cde-4603-bb8f-f075f94db731",
            "experimentId": "ex-c69f8ac6-6bfa-4d35-9a5b-b148f58309db",
            "user": 1,
            "boardname": "",
            "boardr": 255,
            "boardg": 255,
            "boardb": 255,
            "boardtiltx": 0,
            "boardtilty": 0,
            "boardbackgroundr": 0,
            "boardbackgroundg": 0,
            "boardbackgroundb": 0,
            "boardbackgroundurl": "http://res.cloudinary.com/gsusosa/image/upload/v1554054936/mwgqzzrqtvx2v5dtftdg.jpg>https://res.cloudinary.com/gsusosa/image/upload/v1554054936/mwgqzzrqtvx2v5dtftdg.jpg"
        }
    }
 */
let exData = null;
//True when stims are being rendered
let stimsShowing = false;

onInit();
//todo: add error messages here, that are shown in a friendly manner to the user
//refer to the showAlert() clearAlerts() methods on other other js pages such as ex_staging.js
function onInit(){
    let url = `${BASE_URL}/api/experiment/invites/`+invId;
    axios.get(url).then(
        (res) =>{
            if(res.data.status !== 'ok'){
                console.error('Failed to load experiment! ' + res.data.message);
                return;
            }
            invite = res.data.invite;
            if(!invite){
                console.error('Failed to get invite.');
                return;
            }
            if(invite.isExpired){
                console.error('Cannot work on expired invite');
                return;
            }
            console.debug('got invite ' + Object.keys(invite));
            url = `${BASE_URL}/api/configs/${invite.exConfigID}`;

            //Load the configuration
            axios.get(url).then(
                (res) =>{
                    if(res.data.status !== 'ok'){
                        console.error('Failed to load experiment! [ResolveConfig] ' + res.data.message);
                        return;
                    }
                    config = res.data.config;
                    if(!config){
                         console.error('Failed to load experiment! [ResolveConfig], not a proper config object! ');
                        return;
                    }
                    //Load full experiment
                    url =  `${BASE_URL}/api/experiment/package/${config.experimentId}`;
                    axios.get(url).then(
                        (res) =>{
                            if(res.data.status !== 'ok'){
                                console.error('Failed to load experiment! [PackageExperiment] ' + res.data,message);
                                return;
                            }
                            exData = res.data.items;
                            onAttach();
                            console.debug('Finished invite resolution process. Resolved to [Config,ExPackage]')
                        }
                    ).catch(
                        (err) =>{
                            Promise.reject(err).catch(
                        (err) =>{
                            console.error('Ironically failed while failing another promise, could not load experiment, ' + err)
                        }
                    )
                        }
                    )


                }
            ).catch(
                (err) =>{
                    Promise.reject(err).catch(
                        (err) =>{
                            console.error('Ironically failed while failing another promise, could not load experiment, ' + err)
                        }
                    )
                }
            )

        }
    ).catch(
        (err) =>{
            console.error('Failed to load experiment! An exception occured: ' + err );
        }
    )
}
function onAttach(){
    console.debug('Attaching data');
    initExperimentScene(true);
    setBoard(exData.board, config);
    //hopefully disables dragging of stims.
    toggleDraggableStims(false);

}

function toggleStims() {
    if(!stimsShowing){
         addStimsToBoard(exData.stims);
         stimsShowing = true;
         //Update UI
         $('#exStimViewButton').text('Hide Stims');
    }
    else{
        clearFullBoard();
        stimsShowing = false;
         //Update UI
         $('#exStimViewButton').text('Show Stims');
    }
}

function handleUserStartsExperiment(){
    let url = `${BASE_URL}/subject/pres/${encodeDataBundle()}`;
    window.location.replace(url);
}

//Returns base 64 data bundle for url
function encodeDataBundle(){
    let promptTime = $('#data').attr('data-prompt-time');
    let data = {
        invite : invite,
        config : config,
        exData : exData,
        tracking : {
            promptTime : promptTime ? promptTime : null,
            startTime : Date.now(),
        }
    };
    return base64_url_encode(
            JSON.stringify(data)
    )
}


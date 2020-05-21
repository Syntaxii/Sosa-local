let exName = '';
let alertTimeout = 1500;
let userRequestedCancel = false;
let resArray = [];
let exportBound = 0;

//Good practice to check for the existence of your context variables.
// Remember these are set primarily from the template
if(data_user_id.length <1){
    alert('Was unable to retrieve user Id from data field!')
}
function beginCreateExperimentProcess() {
    disableUi();
    displayNamePrompt();
    if(userRequestedCancel){
        showAlert('warning', 'Request cancelled...', true, 3000);
        userRequestedCancel = false;
        return;
    }
    showAlert('info', 'Creating experiment, you will be automatically redirected...', true, 500000);
    //We should have a name by now. Begin request to backend
    let url = BASE_URL + '/api/experiment/create';
    let formData = new FormData();
    formData.append('uid', data_user_id);
    formData.append('exName', exName);
    //Clear exname
    exName = null;
    //Begin response
    axios.post(url, formData).then( function (response) {
        if(response.data.status !== 'ok'){
            //Error
            showAlert('info','Falure, please try again later. \nWhy:'+response.data.message,true, 3000);
        }
        else{
            showAlert('info','Success, wait one moment...',true,50000);
            advanceToLandingPage(response.data)
        }
        enableUi();
    })
        .catch( function (error) {
            showAlert('info','Falure, please try again later. \nWhy:'+error.message,true, 3000);
            alert('Failure for route ' + url + '!\n ' + error.message);
            enableUi();
        })


}

async function getDB() {
    var element = document.getElementById("loaderDiv");
    element.classList.add("is-active");

    var c = document.getElementById("testTakerNameInput").value;
    var d = document.getElementById("experimentNameInput").value;

    sessionStorage.setItem("testTakerName", c);
    sessionStorage.setItem("experimentName", d);

    //Used for requests that leave test taker name empty, i.e. wanting all results/anonymous results from an experiment
    if(c.trim() == "") {

        //Get the bounds for the # of results to iterate through
        let testing = sessionStorage.getItem("experimentName");
        let testurl = BASE_URL + `/api/results/all/${testing}/bounds`;

        await axios.get(testurl)
        .then( (res) => { //Set bound
            exportBound = res.data.items.count;
        })
        .catch( (err) => {
            console.error('Failed to load result ' + err.message);
        })

        //Actually get results here
        for(let i = 0; i < exportBound; i++) {
            let experimentName = sessionStorage.getItem("experimentName");
            let experiment = experimentName;
            let url = BASE_URL + `/api/results/all/${experiment}/${i}`; //new url used for printing all results in given experiment name
    
            //DB get request for results, await slows down the get but fixes random missing data because of asynchronous loop call
            await axios.get(url)
            .then( (res) =>{
                if(res.data.status){
                    if(res.data.status === 'ok'){
    
                        console.log('Got result');
                        resArray.push([res.data.items.experimentName, res.data.items.testerName, res.data.items.stimNum, res.data.items.stimX, res.data.items.stimY, res.data.items.timeStamp]);
                        console.table(resArray);        
                    }
                }
            })
            .catch( (err) => {
                console.error('Failed to load result ' + err.message);
            })
        }
        exportToCsvAdmin();
    } else { //Requests that have both entries

        let name2 = sessionStorage.getItem("testTakerName");
        let url2 = BASE_URL + `/api/results/${name2}/bounds`;

        await axios.get(url2)
        .then( (res) => { //Set bound
            exportBound = res.data.items.count;
        })
        .catch( (err) => {
            console.error('Failed to load result ' + err.message);
        })

        for(let i = 0; i < exportBound; i++) {
            let testTakerName = sessionStorage.getItem("testTakerName");
            let name = testTakerName + i;
            let url = BASE_URL + `/api/results/${name}`;
    
            //DB get request for results, await slows down the get but fixes random missing data because of asynchronous loop call
            await axios.get(url)
            .then( (res) =>{
                if(res.data.status){
                    if(res.data.status === 'ok'){
    
                        console.log('Got result');
                        resArray.push([res.data.items.experimentName, res.data.items.testerName, res.data.items.stimNum, res.data.items.stimX, res.data.items.stimY, res.data.items.timeStamp]);
                        console.table(resArray);        
                    }
                }
            })
            .catch( (err) => {
                console.error('Failed to load result ' + err.message);
            })
        }
        exportToCsvAdmin();
    }
    element.classList.remove("is-active");
}
    

//Export result data to excel file
exportToCsvAdmin = function() {
    let experimentName = sessionStorage.getItem("experimentName");
    let testTakerName = sessionStorage.getItem("testTakerName");

    var CsvString = "Experiment Name, Test Taker Name, Stim ID, From, To, Start Time, End Time\r\n";
    var startTime = "";

    resArray.forEach(function (RowItem, RowIndex) {
        if (RowIndex % 2 == 0) {
            CsvString += resArray[RowIndex][0] + ',' + resArray[RowIndex][1] + ',' + resArray[RowIndex][2] + ',"(' + resArray[RowIndex][3] + ', ' + resArray[RowIndex][4] + ')","(';
            startTime = resArray[RowIndex][5];
        } else {
            CsvString += resArray[RowIndex][3] + ', ' + resArray[RowIndex][4] + ')",' + startTime + ',' + resArray[RowIndex][5];
            CsvString += "\r\n";
        }
    });

    CsvString = "data:application/csv," + encodeURIComponent(CsvString);
    var x = document.createElement("A");
    x.setAttribute("href", CsvString);
    x.setAttribute("download", experimentName + "-" + testTakerName + ".csv");
    document.body.appendChild(x);
    x.click();

    resArray = []; //Clear session's array after each export
}


function advanceToLandingPage(experiment){
    // noinspection JSUnresolvedVariable
    let nextUrl = BASE_URL+'/experiment/edit/'+experiment.exId;
    window.location.replace(nextUrl);
}

function displayNamePrompt(){
    // TODO: Look into JQuery UI and get this showing prettier
    exName = '';
    do{
        exName = prompt('Please enter your experiment name!', 'Enter here...');
    }while(exName === '');

    //fix cancel not working
    if(exName === null){
        userRequestedCancel = true;
    }


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

function disableUi(){
    $('#createExButton').prop('disabled',true);
    $('#loadExButton').prop('disabled', true);
}
function enableUi(){
     $('#createExButton').prop('disabled',false);
    $('#loadExButton').prop('disabled', false);
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

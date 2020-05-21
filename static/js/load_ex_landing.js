
onInit();

function onInit(){
    loadExperimentAsync();
}

function onAttach(){
    setNameLabel(mExperiment.name);
}


function loadExperimentAsync(){
    url = `${BASE_URL}/api/experiments/${data_ex_id}`;
    axios.get(url)
        .then( (res) =>{
            if(res.data.status){
                if(res.data.status === 'ok'){
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

function setNameLabel(newContent){
    $('#exNameDisplay').text(newContent)
}

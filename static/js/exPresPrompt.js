//file globals

//Jira 125
function handleUserConfirmsPrompt(){
    /* This method only needs to use window.location.replace to advance to the presentation page
Attach this method to the onclick of the exConfirmPrompt button*/

    var a = document.getElementById("testTakerNameInput").value;
    var b = document.getElementById("experimentNameInput").value;
    
    if(a.trim() == "") {
        a = "Anon_" +
            Math.random().toString(36).substring(2, 12) + 
            Math.random().toString(36).substring(2, 12) + 
            Math.random().toString(36).substring(2, 12);
    }

    sessionStorage.setItem("testTakerName", a);
    sessionStorage.setItem("experimentName", b);

    let time = Date.now();
    let url = `${BASE_URL}/subject/preview/${data_pres_prompt_invId}/${time}`;
    window.location.replace(url);
}

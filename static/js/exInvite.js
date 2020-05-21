let alertTimeout = 1500;

let emails = '';
let sending = false;

function handleUserInput(target){
    emails = $(target).val()
}

function handleSendExperiment(){
    if(sending) {
        console.warn('Already sending; Please be patient, cancelling!');
        return;
    }
    sending = true;
    toggleButtons(false);

    if(!checkEmails()){
        //Error
        alert('Make sure your emails are formatted correctly, with a comma "," seperating each email!');
        toggleButtons(true);
        sending = false;
        return;
    }

    let url = BASE_URL + '/api/experiment/invite';
    let data = new FormData();
    data.append('uid', data_invite_user_id);
    data.append('exConfigId', data_invite_config_id);
    data.append('emails', emails);

    axios.post(url,data).then(
        (res) =>{
            if(res.data.status !== 'ok'){
                alert('Had an error happen during sending! msg?: '+ res.data.message)
                toggleButtons(true);
                sending = false;
            }
            else{
                alert('Sent!');
                window.history.back();
            }
        }
    ).catch(
        (err) =>{
            alert('Failed to send invites! Please try again later... ');
            console.debug(err);
            toggleButtons(true);
            sending = false;
        }
    )
}


function checkEmails(){
     //Thanks Matt https://stackoverflow.com/questions/4412725/how-to-match-a-comma-separated-list-of-emails-with-regex
    return emails.match('^[\\W]*([\\w+\\-.%]+@[\\w\\-.]+\\.[A-Za-z]{2,4}[\\W]*,{1}[\\W]*)*([\\w+\\-.%]+@[\\w\\-.]+\\.[A-Za-z]{2,4})[\\W]*$');
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
function toggleButtons(on){
    if(!on){
         $('#exSendButton').text('Busy...');
    }
    else{
        $('#exSendButton').text('Send Invites');
    }

    $('#exInviteBackButton').attr('disabled',!on);
    $('#exInviteSendButton').attr('disabled',!on);
}

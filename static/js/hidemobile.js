let disabled = DEBUG_MODE; //TODONE: Change this to false before final.
let backup = null;

function hideMobile() {
    try {
        if (disabled) {
            return;
        }
        var width = window.matchMedia("(max-width: 1200px)");
        if (width.matches) {
            var container = document.getElementById("mx-auto");
            while (container.firstChild) {
                if (!backup) {
                    backup = container.firstChild;
                }
                container.removeChild(container.firstChild);
            }
            var heading = document.createElement("h3");
            var message = document.createElement("small");
            var headText = document.createTextNode("Oops!");
            var messageText = document.createTextNode("Your screen size is too small. If you are using a mobile device, please access SOSA on a computer. If you are using a computer, please resize your browser and refresh the page.");
            heading.appendChild(headText);
            message.appendChild(messageText);
            container.appendChild(heading);
            container.appendChild(message);
        } else {
            let container = document.getElementById("mx-auto");
            container.appendChild(backup);
            backup = null;
        }
    }catch (e) {
        console.warn('Not hiding, as no root or err ' + e)
    }
}

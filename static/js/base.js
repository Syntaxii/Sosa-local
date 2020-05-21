/*
Mostly just contains variables that we should load always, notably, whichever base url we're using for requests

 Axios cheat sheet: https://kapeli.com/cheat_sheets/Axios.docset/Contents/Resources/Documents/index

 */

let BASE_URL = 'http://127.0.0.1:8000'; //Baseurl to be used with requests.
let DEBUG_MODE = false; // todone: remember to unset this flag! [Debug]

//Used so mmuch, decided to just add it here
 function getEventTarget(e) {
            e = e || window.event;
            return e.target || e.srcElement;
 }

/**
 * New method, sometimes when we double parse json by mistake it returns '\' in the text.
 * This creates problems with serialization, so to be safe use this method to filter out Json objects contained within bigger json objects
 * Almost certainly we wouldn't need this method 8/10 times, but it's nice to cover for the 2/10 times.
 * @param json
 * @returns parsed json object
 */
 function safeJsonParse(json){
     let removedBackslash = json.replace(/\\/g, "");
     //Sanitize quotes from where it tries to store a json object inside: a string
     let sanitizeObjectBeginning = replaceAll(removedBackslash,"\"{","{");
     let clean = replaceAll(sanitizeObjectBeginning,'}"',"}");
     return JSON.parse(clean)
 }

 function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
function base64_url_encode($input) {
 return btoa(_encodeUrl64($input));
}

function base64_url_decode($input) {
 return atob(_decodeUrl64($input));
}

//https://jsfiddle.net/magikMaker/7bjaT/
/**
 * use this to make a Base64 encoded string URL friendly,
 * i.e. '+' and '/' are replaced with '-' and '_' also any trailing '='
 * characters are removed
 *
 * @param {String} str the encoded string
 * @returns {String} the URL friendly encoded String
 */
function _encodeUrl64(str){
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
}

/**
 * Use this to recreate a Base64 encoded string that was made URL friendly
 * using Base64EncodeurlFriendly.
 * '-' and '_' are replaced with '+' and '/' and also it is padded with '+'
 *
 * @param {String} str the encoded string
 * @returns {String} the URL friendly encoded String
 */
function _decodeUrl64(str){
    str = (str + '===').slice(0, str.length + (str.length % 4));
    return str.replace(/-/g, '+').replace(/_/g, '/');
}

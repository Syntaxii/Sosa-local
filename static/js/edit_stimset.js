//Define global structures/variables/objects
let saving = false; //This flag will be true when saving stims
let loading = false; //This flag will be true when loading stims
let dbError = false;
let alertTimeout = 1500;
//this flag will be true when there is an error in the db.
//
let mStimsetId = null;
//Currently selected stim
var mCurrentStimIndex;
var mCurrentStim;

//Time out after 5 attempts to make a request
/*
let mTimeoutAfter = 5;
let mStimsetGetAttempt = 0;
*/
// Defaults
mDefaults = {
    DEFAULT_ORDER: 'Order 1'
};

mStimList = {
    baseList : [],    //baseList is the internal collection of stims in whatever current order we have.
    currentOrder : mDefaults.DEFAULT_ORDER,   //current order holds the string name of the current list
    //Define functions
    getList : function() {
        return this.baseList;
    },
    getCurrentOrder : function() {
        return this.currentOrder
    },
    setOrder: function(orderName){
        if(orderName !== this.currentOrder){
            if(this.count() === 0){
                console.log('Cannot switch to order without stims existing in structure!')
            }
            else{
                //Check if the order is valid before we switch to it
                baseStimOrders = JSON.parse(this.baseList[0].orders);
                if (!baseStimOrders.hasOwnProperty(orderName)){
                    //If we can't find the order name as a valid key in any stim's orders dictionary.
                    console.log(`Could not find order ${orderName} as a valid order in ${Object.keys(baseStimOrders)}`);
                    return
                }

            }
        }
        //Otherwise simply set the orderName
        this.currentOrder = orderName;

        //select the first item
        if(this.count() > 0){
           selectStim(0)
        }
        //Update UI with new order
        this.syncWithGuiList();



    },
    clear: function() {
        this.currentOrder  = mDefaults.DEFAULT_ORDER;
        this.baseList = [];
    },
    count: function() {
        return this.baseList.length;
    },
    updateList : function(newStims) {
        this.baseList = newStims;
        this.syncWithGuiList();
    },
    addStim : function(newStim){
        if(this.count() > 0){
            //Grab orders from existing stim, if it exists
            orders = JSON.parse(
                this.baseList[0].orders
            );
            //Iter through keys and set the new stim to the last in the list
            for (let key in orders){
                if(orders.hasOwnProperty(key)){
                    console.log('Setting order for stim,key' + newStim.stimlabel + ', ' + key + ' to ' + this.count());
                    orders[key] = this.count();
                }
            }
            //Update the new orders
            newStim.orders = JSON.stringify(orders);
        }
        //add to the list
        this.baseList.push(newStim);
    },
    removeStim : function(stim){
        console.warn(`removing stim ${stim.stimlabel}`);
        let stims = this.getListInOrder();
        let delStimOrders = JSON.parse(stim.orders);
        let index = delStimOrders[this.currentOrder];
        stims.splice(index,1);
        //for each order, go through if the index is higher than deleted order index decrement one. Else do nothing
        this.getStimOrders().forEach(
            (order,idx) =>{
                //Update ordering
                for(let i = 0; i< stims.length ; i++){
                    //Load orders for current stim
                    let stimOrders = JSON.parse(stims[i].orders);
                    if(stimOrders[order] >= stims.length){
                         console.log(
                            `correcting stim ${stims[i].stimlabel} in order ${order} from ${stimOrders[order]} to ${(stimOrders[order] - 1)}`
                        );
                        stimOrders[order] = stimOrders[order] - 1; //decrement 1 to correct
                        //Save the new order
                        stims[i].orders = JSON.stringify(stimOrders);
                        continue;
                    }
                    //If index needs to be adjusted
                    if(stimOrders[order] > delStimOrders[order]){
                        console.log(
                            `correcting stim ${stims[i].stimlabel} in order ${order} from ${stimOrders[order]} to ${(stimOrders[order] - 1)}`
                        );
                        stimOrders[order] = stimOrders[order] - 1; //decrement 1 to correct
                        //Save the new order
                        stims[i].orders = JSON.stringify(stimOrders);
                    }
                }
            }
        );
        //Select previosu stim
        if(mCurrentStimIndex > 0) {
            mCurrentStimIndex = --mCurrentStimIndex
        }
        else {
            mCurrentStimIndex = 0;
        }
        //Update list with the new adjusted stims
        this.updateList(stims)


    },

    getIndex : function(index){
        if(index < 0 || index >= this.count()){
            console.log(
                `err, ${index} was pass for index, however it is out of bounds [0-${this.count()}]`
            );
            return;
        }
        return this.getListInOrder(mStimList.getCurrentOrder())[index];// TODO: should there be a error handler here for out of bounds?(yes)
    },
    getStimOrders : function() {
        if(this.count() === 0){
            return [mDefaults.DEFAULT_ORDER]
        }
        //Load the orders dictionary from the first stim
        let orders = JSON.parse(this.baseList[0].orders);

        //console.log(Object.keys(orders));

        return Object.keys(orders);

    },
    //This method is not the fastest, but should work.
    setStimInOrder: function(stim,orderName = mStimList.getCurrentOrder()){
        this.baseList = this.getListInOrder(orderName);
        //Update the stim
        this.baseList[stim.orders[orderName]] = stim
    },
    getListInOrder: function(orderName = mStimList.getCurrentOrder()){
        return this.baseList.sort(
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

    },
    //Updates the gui list with the contents of the data structure
    syncWithGuiList: function(){

        //Empty gui list
        $('#stimlist').empty();
        //itr through stims in order
        this.getListInOrder().forEach(stim =>{
            orderIndex = JSON.parse(stim.orders)[this.currentOrder];
            //build li element
            stimLi = $('<li></li>')
                .text(stim.stimlabel)
                .addClass('stim-li')
                .addClass('list-group-item')
                //Ensure you attach the approriate order
                .attr('data-index', orderIndex );
            //Add to list.
            $('#stimlist').append(stimLi);
        });

        if(this.count() === 0){
            console.log('warnin, list empty');
            return;
        }
        //reselect stim if it exists
        if(mCurrentStimIndex){
             selectStim(mCurrentStimIndex);
        }
        else{
            selectStim(0)
        }

        console.log('stimlist synced');


    }
};



//Main Body [To be ran as a script]
//Typically where onInit logic belongs.
onInit();




//Member functions

//Called when the JSfile loads. Note that this does not promise attachment. Unless you know what you're doing, you should add to onAttach() instead.
function onInit(){

    //Get stimset id to attach to new stims.
    //TODO: Possibly add a check to the EndSetStimsForExperiment that can automatically attach the stimset id. This would help eliminate requests.
    getStimsetAsync();
    //test if variables are pulling
    console.log('pulled uid: '+ data_editstims_userId + ' exId: ' + data_editstims_exId);
   //Put stuff here that you want to run once the page loads this script/
    /*
        Good place to use JQuery to bind clicks
        Good place to setup the initial UI state
     */

    /*
    //Fill initial list
    let testStims = _testGenStims();
    mStimList.updateList(testStims);
    testGetListInOrder();
    //Test stim reordering
    mStimList.setOrder('order 1');
    //Should not work as c is last in order 1
    testMoveStimOrderDown(3);
    testGetListInOrder();
    testMoveStimOrderUp(3);
    testGetListInOrder();
    */


}

function setDefaultOrder() {
    if(this.mStimList.count() === 0){
        //Set order
        this.mStimList.setOrder('Order 1');
    }
    else{
        //TODO: test setting default order with preloaded orders
        this.mStimList.setOrder(
            Object.keys(
                JSON.parse(mStimList.getList()[0].orders)
            )[0] //Get the first orders key of the first objects in our list
        )
    }
}

function loadStimOrdersGUI() {
    "use strict";
    //Clear the list frist
    $('#orders').empty();
    //Fill It
    mStimList.getStimOrders().forEach(
        (order, idx) => {
            let opt = $('<option></option>')
                .text(order);
            //Append to list
            $('#orders').append(opt);
        }
    );
    //Fix value reset on rerender.
    $('#orders').val(mStimList.currentOrder);


}

//Called by system after document has been loaded and  stimset context has been attached.
function onAttach(){

    $(document).ready(() =>{
        //Test phase
        /*
        //Test add stim
        addNewStim();
        testGetListInOrder();
        //mStimList.getStimOrders();

         //Clear testing
         clearLists();
         //Actual code after here
         */

        //Try Initial Load
        loadStimsForExperiment();
        setDefaultOrder();


          // Set shape event listener
        $("#shapes").change(() => updateStimShape());

        //First sync
        //this.mStimList.syncWithGuiList();


        //Attaches functions to our buttons
        attachHandlers();

    })


}

function onLoad() {
    //Syncs this stims with the one displayed on the GUI
        this.mStimList.syncWithGuiList();
        //Syncs the new orders with the list
        loadStimOrdersGUI();

         //Blank label if no loaded stim label else, load label
        console.log('init label render');
        if(mCurrentStim){
            window.sosa.updateStimLabelRender(mCurrentStim.stimlabel);
        }
        else{
            window.sosa.updateStimLabelRender('');
        }

        showAlert('info','Load Complete!', true)

}

//Attaches on click functions to buttons.
function attachHandlers(){
    $("#orderPlusBtn").on("click",
        handleAddOrder
    );
    $("#orderMinusBtn").on("click",
        handleRemoveOrder
        );
    $("#stimUpBtn").on("click", wrapperStimUp);
    $("#stimDnBtn").on("click", wrapperStimDn);
}

function wrapperStimUp(){
    moveStimUp(mCurrentStim);
    //Follow the stim
    if(mCurrentStimIndex !== 0){
        unSelectAllStims();
        selectStim(--mCurrentStimIndex)
    }
}

function wrapperStimDn(){
    moveStimDown(mCurrentStim);
     //Follow the stim
    if(mCurrentStimIndex !== mStimList.count() - 1){
        unSelectAllStims();
        selectStim(++mCurrentStimIndex)
    }
}

//Adds a new stim
function addNewStim(){
    if(!this.mStimsetId){
        console.log('cannot add new stim when detached. Please wait for attachment or reload the page. Also check your url contains the proper experiment id!');
        return;
    }
    //Don't worry about preserving order. List.add stim shoudl do that
    //Create new stim with base settings
    myNewStim = {
        //Default label is just the count
        'stimlabel' : `Stim ${mStimList.count()+1}`,
        //Literally will bereplaced by data structure.
        'orders': JSON.stringify(
            {
            'Order 1': 0
            }
        ),
        "imageUrl": "''",
        "stimr": "150",
        "stimb": "0",
        "stimg": "0",
        "labelr": "0",
        "labelb": "0",
        "labelg": "0",
        "stimshape": 'Cylinder',
        "stimsetid": this.mStimsetId,
    };

    //Push to mStimList, always use the add stim function
    this.mStimList.addStim(myNewStim);
    //Remember to update the GUI
    this.mStimList.syncWithGuiList();

}
function removeStim(){
    //really just is a wrapper function
    if(mStimList.count() <=1){
        console.warn('cannot remove lonely/no stim');
        return;
    }
    mStimList.removeStim(mCurrentStim)
}

//loads Stims for the experiment from the database and sets them to default order
function loadStimsForExperiment(){
    //This if statement terminates the function if loading is true
    if(this.loading){
        console.warn('already loading stims!');
        return;
    }

    console.log('loading stims...');
    this.loading = true;
    //gets the stimset for the experiment from the database
    let url = `${BASE_URL}/api/stimsets/${data_editstims_exId}`;
    axios.get(url).then( (request) =>{
        console.log(request.data.items);
        this.mStimList.updateList(request.data.items);
        //checks if the mStimList is empty, if so creates a default stim
        if(this.mStimList.count() === 0){
            console.warn('Creating Default Stim');
            //Add default stim
            addNewStim();
        }
        onLoad();
        this.loading = false;

        console.log('loading is done');

    })  //error handling
        .catch( (error) =>{
            console.error('failed loading, why?\n'+error.message);
            showAlert('error',' Failed loading stims! Please try again later!', true, 100000);
            this.loading = false;
            console.log('loading is done');
        });



}

function validateStims(){
   for (let stim of mStimList.getList()){
       if(stim.stimlabel.length < 1 || ! stim.stimlabel.match('^(?=.*[\\w\\d]).+')){
            return {
                pass: false,
                msg: 'Cannot have empty stim label!',
                badIdx: JSON.parse(stim.orders)[mStimList.getCurrentOrder()]
            };
       }
   }
   return {
       pass: true
   }
}

function saveStims(){
    if(saving === true){
        console.log("Already saving, please try again later");
        return;
    }

    let validationLog = validateStims();
    if(!validationLog.pass){
        showAlert('warning','Please fix an error with your stimulus: \n' + validationLog.msg, true, 3000);

        unSelectAllStims();
        selectStim(validationLog.badIdx);
        return;
    }

    //Show alert
    showAlert('info', 'Saving...', true, 500000);

    saving = true;
    let data = new FormData();
    data.append('uid', data_editstims_userId);
    data.append('exId', data_editstims_exId);
    data.append('stims', JSON.stringify(mStimList.getList() ));
    axios.post('/api/stimsets/set', data)
        .then(function (response) {//holder for successful work
            console.log(response.data);
            console.log('save successful!');
            saving = false;     //this allows another save  ajax request
            showAlert('info','Save successful!', true);


        })
        .catch(function (error) {//holder for error
            console.log('err, was not able to save');
            console.log(error.message);
            dbError = true; //set the error flag to note shit
            saving= false;
           showAlert('error','Unable to save, please try again later...', true);

        })

}

function moveStimUp (stimObj){      //will have an up and down function to make the HTML binding easier and keep the logic easier to check.
    //Fixed .label to .stimlabel
    console.log('Moving stim '+ stimObj.stimlabel + ' up');
    let aOrders = JSON.parse(stimObj.orders);
    let bIndex = aOrders[mStimList.getCurrentOrder()] - 1;
    if(bIndex < 0){
        //Out of bounds
        console.log('Unable to move first stim up!');
        return;
    }
    let stimB = mStimList.getIndex(bIndex);

    let bOrders = JSON.parse(stimB.orders);
    //Swap
    aOrders[mStimList.getCurrentOrder()] = bIndex;
    bOrders[mStimList.getCurrentOrder()] = bIndex + 1; // + 1 to move down
    //Be sure to update the models
    stimObj.orders = JSON.stringify(aOrders);
    stimB.orders = JSON.stringify(bOrders);
    //Be sure to store the updated models back in the stimlist
    mStimList.setStimInOrder(stimObj);
    mStimList.setStimInOrder(stimB);
    //Refresh the gui list
   mStimList.syncWithGuiList();

}


function moveStimDown (stimObj){
    //Fixed .label to .stimlabel
    console.log('Moving stim '+ stimObj.stimlabel + ' down');
    let aOrders = JSON.parse(stimObj.orders);
    let bIndex = aOrders[mStimList.getCurrentOrder()] + 1;
    if(bIndex === mStimList.count()){
        //Out of bounds
        console.log('Unable to move last stim down!');
        return;
    }
    let stimB = mStimList.getIndex(bIndex);

    let bOrders = JSON.parse(stimB.orders);
    //Swap
    aOrders[mStimList.getCurrentOrder()] = bIndex;
    bOrders[mStimList.getCurrentOrder()] = bIndex - 1; // -1 to move up one
    //Besure to update the models
    stimObj.orders = JSON.stringify(aOrders);
    stimB.orders = JSON.stringify(bOrders);
    //Besure to store the updated models back in the stimlist
    mStimList.setStimInOrder(stimObj);
    mStimList.setStimInOrder(stimB);

    //Refresh the gui list
   mStimList.syncWithGuiList();
}


function handleAddOrder(){
    "use strict";
    let currentOrders = mStimList.getStimOrders();
    let newOrderName = `Order ${currentOrders.length + 1}`;
    //let newOrderName = 'Order 1';
    let baseNewOrderName = newOrderName;
    //check If there already exists an order with the same name
    let orderNameUnique = false;
    let copyCount = 0;
    while(!orderNameUnique){
        for(let i = 0; i<currentOrders.length; i++){
            let itrOrder = currentOrders[i];
            if(itrOrder === newOrderName){
                ++copyCount;
                newOrderName = "Order " + (currentOrders.length + copyCount);
                break;
            }
            else{
                if(i === currentOrders.length -1){
                    //if on thelast order an still no other match. It should be unique. Set flag and break
                    orderNameUnique = true;
                    break;
                }
            }
        }
    }
    addOrder(newOrderName, true);
    //Switch to newly added order.
    mStimList.setOrder(newOrderName);
    //update UI to follow
    $('#orders').val(newOrderName);
}

function handleChangeOrder(target){
    mStimList.setOrder(
        $(target).val()
    )
}
function addOrder(newOrderName, switchToNewOrder = false){
  /* Task 41 This task is to implement the add order button, you're essentially creating the handler function
remember, when a new order is created we copy the order indices  from the last order to use
as the new order.
 */
  this.mStimList.getList().forEach(
      (stim, idx) =>{
          orders = JSON.parse(stim.orders);
          console.log('old orders ' + Object.keys(orders));
          //copy the previous order idx to the new order and append.
          orders[newOrderName] = orders[this.mStimList.getCurrentOrder()];
          console.log('new orders ' + Object.keys(orders));
          stim.orders = JSON.stringify(orders);
          //update the actual stim in the list lol
          this.mStimList.setStimInOrder(stim);
      }
  );
  //Update GUI with new orders
  loadStimOrdersGUI();
  if(switchToNewOrder){
      //call function to switch order
      this.mStimList.setOrder(newOrderName);
      this.mStimList.syncWithGuiList();
  }

}


function handleRemoveOrder(){
    let rmOrder = $('#orders').val();
    removeOrder(rmOrder);
    loadStimOrdersGUI();
}


function removeOrder(orderName){

    /* needs to contain the same order keys 1:1
    This task is to implement remove order functionality.
    It should only remove the selected order
    It should not work if ordercount is 1
    It should modify the local ordered structure
    *
    * */
    if (this.mStimList.getStimOrders().length <= 1) {
        console.warn('Can not remove last order');
        return;
    }
      //Set the order to the order before the one that got deleted, or if it's zero, set it to the new first order
    let ordersSafe  = mStimList.getStimOrders();

    let delIdx = ordersSafe.indexOf(mStimList.currentOrder);
    ordersSafe.splice(delIdx, 1);

    let returnIdx = delIdx === 0? 0: delIdx - 1;
    let newOrder = ordersSafe[returnIdx];

    this.mStimList.setOrder(newOrder);
    //Remove the order
    this.mStimList.getList().forEach(
      (stim, idx) => {

          orders = JSON.parse(stim.orders);

          delete orders[orderName];
           //Update stim
          stim.orders = JSON.stringify(orders);

          //update the actual stim in the list lol
          this.mStimList.setStimInOrder(stim);

      }
  );
    mStimList.syncWithGuiList();

  //This needs to be reversed
}



function clearLists() {
    console.log('clearing stims from structure');
    this.mStimList.clear();
    console.log('clearing gui list too.');
    //Clear gui list
    $('#stimlist').empty();




}
//Very sexy method
function selectStim(index){
    if(index > this.mStimList.count()){
        console.warn('warning, selectstim passed index thatis greater than what is contained in structure. possible desync?')
    }
    stims = $('.stim-li');
    // todo: iterate through the stims list and find whichever one has the required data-index;
    for (let i=0; i<stims.length; i++){
        currentItrIndex = $(stims[i]).attr('data-index');
        if(currentItrIndex === index.toString()){
            $(stims[i]).addClass('active');
            break;
        }

    }
    //Set current
    this.mCurrentStimIndex = index;
    //Set the stim to the curent stim at the index in the currently loaded order state.
    this.mCurrentStim = this.mStimList.getIndex(index);
    //Update Sliders/Inputs to match currently selected stim
    updateInputs();
    //Switch shapes
    switchStimShape();
    //Update 3JS scene
    updateStimPreview();

    //Update label box text
    $('#labelEntry').val(this.mCurrentStim.stimlabel);

    //TODONE: Don't show the label for now, figure out scaling first.
     window.sosa.updateStimLabelRender(this.mCurrentStim.stimlabel);

}

//Should likely only need to be called by selectStim to update the UI
function updateInputs(){
    let stim = this.mStimList.getIndex(this.mCurrentStimIndex);
    //Set stim color slider values
    $('#RvalueStim').val(stim.stimr);
    $('#GvalueStim').val(stim.stimg);
    $('#BvalueStim').val(stim.stimb);
    //Set stim label color slider values
    // todo: currently you can't modify these, butg we'll still set them. Add way to change label color.
    $('#lRvalueStim').val(stim.labelr);
    $('#lGvalueStim').val(stim.labelg);
    $('#lBvalueStim').val(stim.labelb);

}
function updateStimPreview(){
    setPegRGB();
    setLabelRGB();
}

//TODO: Split this into seperate functions updateStimR updateStimG updateStimB
function updateStimRGB(){
    mCurrentStim.stimr =  $('#RvalueStim').val();
    mCurrentStim.stimg =  $('#GvalueStim').val();
    mCurrentStim.stimb =  $('#BvalueStim').val();
    //Besure to update the stim in the list
    this.mStimList.setStimInOrder(mCurrentStim);
    //Update the color in ThreeJs
    setPegRGB();
}

// shapedropdown -> stim.stimshape -> switchStimShape
function updateStimShape(){
    if(!this.mCurrentStim){
        console.log('warning, no selected stim');
        return;
    }
    //Shape dropdown -> stim.stimshape
    this.mCurrentStim.stimshape = $("#shapes").val();
    //Update in list
    this.mStimList.setStimInOrder(this.mCurrentStim);
    //Update gui.
    switchStimShape();
}

// stim.stimshape -> shape dropdown -> UI
function switchStimShape(){
    console.log('Switching stim shape');
    if(!this.mCurrentStim){
        console.warn('warning, no selected stim');
        return;
    }
    $("#shapes").val(this.mCurrentStim.stimshape);
     $("#id_stimshape").val(this.mCurrentStim.stimshape);
     //Make global call to refresh stimshape
     window.sosa.refreshStimShape();
}

function updateStimLabel(content){
    if(!this.mCurrentStim){
        console.warn('no selected stim to update label');
        return;
    }
    this.mCurrentStim.stimlabel = content;
    this.mStimList.setStimInOrder(this.mCurrentStim);
    //The sync should call select which will update the label render
    this.mStimList.syncWithGuiList();



}

//TODO (maybe): Split this into seperate functions updateLStimR updateLStimG updateLStimB
function updateStimLabelRGB(){
    mCurrentStim.labelr =  $('#lRvalueStim').val();
    mCurrentStim.labelg =  $('#lGvalueStim').val();
    mCurrentStim.labelb =  $('#lBvalueStim').val();
    //Besure to update the stim in the list
    this.mStimList.setStimInOrder(mCurrentStim);
    //Update the color in ThreeJs
    setLabelRGB();
}
function unSelectAllStims(){
     let activeStims = document.getElementsByClassName('active');
            let i = 0;
            for(i; i < activeStims.length;i++) {
                activeStims[i].classList.remove('active');
            }
}
function holdForAxiosLoad() {
    while( !axios.get){
    }
}
function getStimsetAsync() {
    url =`${BASE_URL}/api/stimsets/id/${data_editstims_exId}`;
    holdForAxiosLoad(); //Block until axios is loaded into the env

    axios.get(url)
        .then( function (res) {
            content = res.data;
            if(!content.items){
                console.log('No stimset model recieved!');
                return;
            }
            this.mStimsetId = content.items[0].pk;
            console.log(`Got stimset id ${this.mStimsetId}`);

            onAttach();

        })
        .catch( function (err) {
            if(err.message){
                console.log(err.message);
            }
            if(this.mStimsetId.includes('sts')){
                return; //Success and this is a bad error.
            }
            this.mStimsetGetAttempt++;
            if(this.mStimsetGetAttempt === this.mTimeoutAfter){
                alert('Was unable to load stimset! Please save if needed and refresh.');
                return;
            }
            console.log('error loading stimset. Retrying...');
            setTimeout(getStimsetAsync,1000);
        })

}
//Utils
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



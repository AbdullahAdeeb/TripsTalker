//////////////////////////////////////////////////
//               APP
//////////////////////////////////////////////////
var testing = {
    start:function(){
        console.log("TESTING MODE ON");
        window.plugins = '';
        window.plugins.pushNotification = '';
        app.onDeviceReady();
    }
}

var app = {
    activePage:"",
	apiReady: false,
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },

    update: function(){
        trips.getListFromDB(session.data.id);
        friends.getListFromDB(session.data.id);
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        console.log('Binding Events');
        $(document).on('deviceready', this.onDeviceReady);
        $(document).on("pagecreate","#login_page", this.onLoginPage);
        $(document).on("pagecreate", "#trip_page", this.onTripPage);
        $(document).on("pagecontainerbeforeshow", this.onBeforeShow);        
        $(document).on('apiReady',this.onApiReady);
    },    
        
    onDeviceReady: function() {
        console.log('device is ready:'+device.platform);
        pushNotification = window.plugins.pushNotification;
        session.check();
    },
    
    onApiReady: function(){
        console.log('api is ready');
        app.apiReady = true;
        //TODO: check session earlier this is taking too long on cold load
//            session.check();
    },
    
    onLoginPage: function(event,data){
        console.log('login page created');
        
    },
    
    onTripPage: function(event,ui) {
            console.log('trip-page init');
            $( document ).on( "swipeleft swiperight", "#trip_page", function( e ) {
                // We check if there is no open panel on the page because otherwise
                // a swipe to close the left panel would also open the right panel (and v.v.).
                // We do this by checking the data that the framework stores on the page element (panel: open).
                if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
                    if ( e.type === "swipeleft"  ) {
                        $( "#trip_panel" ).panel( "open" );
                    } else if ( e.type === "swiperight" ) {
                        $( "#no_panel" ).panel( "open" );
                    }
                }
            });
    },
    onBeforeShow: function(event,ui){
        app.activePage = $.mobile.pageContainer.pagecontainer("getActivePage")[0].id;
        console.log('active page: '+app.activePage);
        if(app.activePage == "trips_page") {
            $("#trips_list").listview('refresh');
        }else if(app.activePage == "friends_page") {
            $("#friends_list").listview('refresh');
			console.log("friends is refreshed");
        }
    }
}

//////////////////////////////////////////////////
//               NAV
//////////////////////////////////////////////////
var nav = {
    slideDown: function(page,track){
        $.mobile.pageContainer.pagecontainer('change', '#'+page, {
            transition: 'slidedown',
            changeHash: track,
            reverse: false,
            showLoadMsg: true
            });
    },

    slideUp: function(page,track){
        $.mobile.pageContainer.pagecontainer('change', '#'+page, {
            transition: 'slidedown',
            changeHash: track,
            reverse: true,
            showLoadMsg: true
        });
    },
    
    goTo: function(page,track){
        if(app.activePage == page){
            return;
        }
        $.mobile.pageContainer.pagecontainer('change', '#'+page, {changeHash: track});
    },
    
    flipPage: function(page,track){
        $.mobile.pageContainer.pagecontainer('change', '#'+page, {
            transition: 'flip',
            changeHash: track,
            reverse: true,
            showLoadMsg: true
        });
    },flipPageOnCount: function(page,track){
        if(currentCount < triggerCount)return;
        nav.flipPage(page,track);
    },
    popError: function(message){
        $("#error-dialog-content").html(message);
        $('#errorpop').popup();
        $('#errorpop').popup('open', {transition: 'pop'});
    }        

}
/////////////////////////////////////////////////////////
//////              SESSION
////////////////////////////////////////////////////////
var session= {
    data:"",
    load:function(){
        session.data = JSON.parse(localStorage.getItem('session'));
        console.log('user ID = '+session.data.id);
        push.init();

    },
    check: function(){
        var s = localStorage.getItem('session');
        if(s != undefined && s != null && s != ""){ // session is found 
            console.log('old session found');
            
            session.load();
            
            nav.flipPage('trips_page',false);
            return true;
        }else{         //no session is found, take user to login
            console.log('no session found in local storage must log in');
            nav.flipPage('login_page',false);
            return false;
        }
    },
    clear: function(){
        window.localStorage.clear();
    }
}

/////////////////////////////////////////////////
////          Push Notification
////////////////////////////////////////////////
var push = {
    init: function(){
        console.log('push>> init');
        if (device.platform == 'android' || device.platform == 'Android'){
            pushNotification.register(
              push.successHandler,
              push.errorHandler,
              {"senderID":"557660622898",  // project ID from google api dashboard
              "ecb":"onNotification"}
            );
//        } else if ( device.platform == 'blackberry10'){
//            pushNotification.register(
//              push.successHandler,
//              push.errorHandler,
//              {invokeTargetId : "replace_with_invoke_target_id",
//              appId: "replace_with_app_id",
//              ppgUrl:"replace_with_ppg_url", //remove for BES pushes
//              ecb: "onNotificationBB",
//              simChangeCallback: replace_with_simChange_callback,
//              pushTransportReadyCallback: replace_with_pushTransportReady_callback,
//              launchApplicationOnPush: true
//              });
        } else if(device.platform == 'iOS'){
            pushNotification.register(
            tokenHandler,
            push.errorHandler,
            {
                "badge":"true",
                "sound":"true",
                "alert":"true",
                "ecb":"onNotificationAPN"
            });
        }
    },
    successHandler: function(result){
        console.log('push:successHandle result= '+result);
    },
    errorHandler : function(error){
        console.log('push:errorHandler result= '+error);
    },
    tokenHandler: function (result) {
        // Your iOS push server needs to know the token before it can push to this device
        // here is where you might want to send it the token for later use.
        alert('device token = ' + result);
    }
}

// Android and Amazon Fire OS
function onNotification(e) {
//    $("#app-status-ul").append('<li>EVENT -> RECEIVED:' + e.event + '</li>');
    console.log('event= '+e.event);
    switch( e.event )
    {
    case 'registered':
        if ( e.regid.length > 0 ){
            console.log("regID = " + e.regid+"user ID = "+session.data.id);
            registerSNS(e.regid,session.data.id);
        }
    break;

    case 'message':
        // if this flag is set, this notification happened while we were in the foreground.
        // you might want to play a sound to get the user's attention, throw up a dialog, etc.
        if ( e.foreground )
        {
//            $("#app-status-ul").append('<li>--INLINE NOTIFICATION--' + '</li>');
            // on Android soundname is outside the payload.
            // On Amazon FireOS all custom attributes are contained within payload
//            var soundfile = e.soundname || e.payload.sound;
            // if the notification contains a soundname, play it.
//            var my_media = new Media("/android_asset/www/"+ soundfile);
//            my_media.play();
        }
        else
        {  // otherwise we were launched because the user touched a notification in the notification tray.
            if ( e.coldstart )
            {
//                $("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
            }
            else
            {
//                $("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
            }
        }

//       $("#app-status-ul").append('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
//           //Only works for GCM
//       $("#app-status-ul").append('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
//       //Only works on Amazon Fire OS
//       $status.append('<li>MESSAGE -> TIME: ' + e.payload.timeStamp + '</li>');
    break;

    case 'error':
//        $("#app-status-ul").append('<li>ERROR -> MSG:' + e.msg + '</li>');
    break;

    default:
//        $("#app-status-ul").append('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
    break;
  }
}

// BlackBerry10
function onNotificationBB(pushpayload) {
    var contentType = pushpayload.headers["Content-Type"],
        id = pushpayload.id,
        data = pushpayload.data;//blob

    // If an acknowledgement of the push is required (that is, the push was sent as a confirmed push
    // - which is equivalent terminology to the push being sent with application level reliability),
    // then you must either accept the push or reject the push
    if (pushpayload.isAcknowledgeRequired) {
        // In our sample, we always accept the push, but situations might arise where an application
        // might want to reject the push (for example, after looking at the headers that came with the push
        // or the data of the push, we might decide that the push received did not match what we expected
        // and so we might want to reject it)
        pushpayload.acknowledge(true);
    }
};

// iOS
function onNotificationAPN (event) {
    if ( event.alert )
    {
        navigator.notification.alert(event.alert);
    }

    if ( event.sound )
    {
        var snd = new Media(event.sound);
        snd.play();
    }

    if ( event.badge )
    {
        pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
    }
}

/////////////////////////////////////////////////
///             ACCOUNT
//////////////////////////////////////////////////
var account = {
    resetPWD: function(){
        nav.popError('wait for it');
    },
    //create a session and store it to local storage
    login: function() {
        var email = $('#login_email').val();
        var password = $('#login_password').val();
        var cred = {"email": email,"password": password,"duration": 0};
        // make sure the api is ready before making any api call
        if(app.apiReady){
            window.df.apis.user.login({"body":cred},
                function(response) {  //success handler
                    window.localStorage.setItem("session",JSON.stringify(response));
                    trips.getListFromDB(response.id);
                    friends.getListFromDB(response.id);
                    session.load();

                    nav.flipPage('trips_page',false);

                },
                function(response){ //error handler
                    nav.popError(response.body.data.error[0].message);            
                });
        }else{ //if api is not ready then only call this method when it is ready (won't recurse)
            console.log('waiting for apiReady');
            app.onApiReady = function(){
                console.log('finally apiReady');
                app.apiReady = true;
                account.login();
            }
        }
    },
    register: function(){
        var email = $('#register_email').val();
        var password = $('#register_password').val();
        var repeat_password = $('#register_repeat_password').val();
        var fname = $('#register_first_name').val();
        var lname = $('#register_last_name').val();
        var newUser = {
                "email": email,
                "first_name": fname,
                "last_name": lname,
                "new_password": password
            };  // TODO : encrypt password i.e. json_encrypt()
        if(app.apiReady){
            window.df.apis.user.register(
                {"login":true,"body":newUser},
                function (response){
                        alert("Registeration worked");
                }, function (response){
                    nav.popError(response.body.data.error[0].message);
                }             // error handler
            );
        }else{ //if api is not ready then only call this method when it is ready (won't recurse)
            console.log('waiting for apiReady');
            app.onApiReady = function(){
                console.log('finally apiReady');
                app.apiReady = true;
                account.register();
            }
        }
    },
    logout: function(){
        session.clear();
        $.mobile.pageContainer.pagecontainer('change', '#login_page', {
            transition: 'flip',
            changeHash: false,
            reverse: true,
            showLoadMsg: true
        });
    }
}
//////////////////////////////////////////////////
//               FRIENDS
//////////////////////////////////////////////////
var friends = {
    list:[],
    pending:[],
    requests:[],
    //  GET FRIENDS LIST FUCNTIO
    
    // get data from DB -> local storage THEN onSuccess call friends.load()
    getListFromDB: function(id){
		window.df.apis.db.getRecordsByIds({"table_name":"ttfriends", "ids":id}, 
			function (response) {
				console.log ('we are getting friends!!');
				console.log(response.record[0].friends);
				window.localStorage.setItem("friends",response.record[0].friends);
				window.localStorage.setItem("requests",response.record[0].requests);
				window.localStorage.setItem("pending",response.record[0].pending);
                friends.load();
            },function (response){
                nav.popError("broblem, can't get your friends!");
            });
    },
    load: function(){
        friends.list = window.localStorage.getItem("friends").split(";").sort();
        friends.requests = window.localStorage.getItem("requests").split(";");
        friends.pending = window.localStorage.getItem("pending").split(";");

        friends.updateUI();
    },
    updateUI: function(){
        var list="";
        for( var i =  0 ; i < friends.list.length ; ++i){
            //Add the friends as an li into friends list ul
            list += ('<li><img src="img/ants.png"></img><h1>'+friends.list[i]+'</h1></li>');

        }
        $('#friends_list').html(list); 
        
        if(app.activePage == "friends_page"){
            $("#friends_list").listview("refresh");
        }
        // TWO MORE LOOPS FOR PENDING AND REQUESTS
        
    }

}

//////////////////////////////////////////////////
//               TRIPS
//////////////////////////////////////////////////
var trips = {
    list: [],
    new: function(){
        var name = $(trip_name).val();
        var loc = $(trip_location).val();
        var id = 212; //get this from socket.io
        
        trips.list.push({id:'first',name: name,participants:'',location:loc});
        window.localStorage.setItem('trips',JSON.stringify(trips.list));
//        $('#trips_list').append('<li><a href=javascript:trips.open(\''+name+'\');><img src="img/ants.png"></img><h1>'+name+'</h1><p>'+loc+'</p></a></li>');
        trips.updateUI();
        nav.goTo('trips_page',false);
        
    },
    load: function(){
        trips.list = JSON.parse(window.localStorage.getItem('trips'));
        trips.updateUI();
    },
    addToDB: function(){
    
    },
    getListFromDB: function(){

        //on success
//        window.localStorage.setItem('trips',JSON.stringify([{'id':''}]));
//        trips.load();

    },
    updateUI: function(){
        if(trips.list == null){
            $('#trips_list').html('');
            return;
        }
        var html = "";
        for(i=0;i<trips.list.length;i++){
            html += '<li><a href=javascript:trips.open(\''+trips.list[i].name+'\');><img src="img/ants.png"></img><h1>'+trips.list[i].name+'</h1><p>'+trips.list[i].loc+'</p></a></li>';
        }
        $('#trips_list').html(html);
        
        if(app.activePage == "trips_page"){
            $("#trips_list").listview("refresh");
        }
    },
    open: function(name){
        $("#trip_page_header").html(name);
        nav.goTo("trip_page",true);
        
    }
    
    
}


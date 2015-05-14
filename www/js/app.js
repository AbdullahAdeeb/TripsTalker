//////////////////////////////////////////////////
//               APP
//////////////////////////////////////////////////
var testing = {
    start:function(){
        console.log("TESTING MODE ON");
        window.plugins = {pushNotification:{}};
        device = {platform : 'browser'};
        app.onDeviceReady();
    }
}

var app = {
    activePage:"",
    apiReady: false,
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        app.apiReady = false;
    },

    update: function(){
        events.getListFromDB(session.data.id);
        friends.getListFromDB(session.data.id);
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        console.log("Binding Events");
        $(document).on("deviceready", this.onDeviceReady);
        $(document).on("pagecreate","#login_page", this.onLoginPage);
		$(document).on("pagecreate","#add_member", this.onAddMemberPage);
        $(document).on("pagecreate", "#event_page", this.oneventPage);
        $(document).on("pagecontainerbeforeshow", this.onBeforeShow);        
        $(document).on('apiReady',this.onApiReady);
    },    

    onDeviceReady: function() {
        console.log('device is ready:'+device.platform);
        pushNotification = window.plugins.pushNotification;
        document.addEventListener("backbutton", nav.backButtonHandler, false);
        session.check();
    },

    onApiReady: function(){
        console.log('api is ready');
        app.apiReady = true;
        // show waiting for connection till this is ready
    },

    onLoginPage: function(event,data){
        console.log('login page created');
         if(typeof device === 'undefined'){
            console.log("no device detected: we are on a browser");
            testing.start();
        }
    },
	
	onAddMemberPage: function() {
		console.log('Adding members to event')
		//members.list = JSON.parse(window.localStorage.getItem('friends'));
		
		
		/* console.log('list created')
        for( var i =  0 ; i < members.list.length ; i++){
            //Add the friends as an li into friends list ul
            list += ('<li><img src="img/ants.png"></img><h1>'+members.list[i].name+'</h1></li>');

        }
        $('#members_list').html(list); */ 
	},

    oneventPage: function(event,ui) {
        console.log('event-page init');
        $( document ).on( "swipeleft swiperight", "#event_page", function( e ) {
            // We check if there is no open panel on the page because otherwise
            // a swipe to close the left panel would also open the right panel (and v.v.).
            // We do this by checking the data that the framework stores on the page element (panel: open).
            if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
                if ( e.type === "swipeleft"  ) {
                    $( "#event_panel" ).panel( "open" );
                } else if ( e.type === "swiperight" ) {
                    $( "#no_panel" ).panel( "open" );
                }
            }
        });

    },
    onBeforeShow: function(event,ui){
        app.activePage = $.mobile.pageContainer.pagecontainer("getActivePage")[0].id;
        console.log('active page: '+app.activePage);
        if(app.activePage == "events_page") {
            $("#events_list").listview('refresh');
            console.log("events list refreshed");

        }else if(app.activePage == "friends_page") {
            $("#friends_list").listview('refresh');
            console.log("friends list refreshed");
        }
    }
}

/////////////////////////////////////////////////////////
//////              SESSION
////////////////////////////////////////////////////////
var session= {
    data:"",
    load:function(){
        session.data = JSON.parse(localStorage.getItem('session'));
        console.log('session.load>> user ID = '+session.data.id);
        socket.init();
    },
    check: function(){
        var s = localStorage.getItem('session');
        if(s != undefined && s != null && s != ""){ 
            // session is found 
            console.log('old session found');
            nav.flipPage('events_page',false);
            session.load();
            events.updateUI();
            friends.updateUI();
            return true;
        }else{         
            //no session is found, take user to login
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

        $.mobile.loading("show");
        // make sure the api is ready before making any api call
        if(app.apiReady){
            window.df.apis.user.login({"body":cred}, function(response) {  
                //success handler
                window.localStorage.setItem("session",JSON.stringify(response));
                nav.flipPage('events_page',false);
                session.load(); // will load from localStorage the session 
                push.init();
               
			   //if(events.getListFromDB(response.id) && friends.getListFromDB(response.id)){
                  //  $.mobile.loading("hide");
                //}
				
				events.getListFromDB(response.id);
				friends.getListFromDB(response.id);
				
            }, function(response){
                $.mobile.loading("hide");
                //error handler
                nav.popError(response.body.data.error[0].message);            
            });
        }else{ //if api is not ready then only call this method when it is ready (won't recurse)
            // maybe it's better to just pop out a message saying can't connect to the server
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





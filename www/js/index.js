/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
function register() {
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
    
    window.df.apis.user.register(
        {"login":true,"body":newUser},
        function (response){
                alert("Registeration worked");
        },function (response){
            popError(response.body.data.error[0].message);
        }             // error handler
    );
}
        

function resetPWD(){
    popError('wait for it');
}

function login() {
    var email = $('#login_email').val();
    var password = $('#login_password').val();
    var cred = {
          "email": email,
          "password": password,
          "duration": 0};

    
    window.df.apis.user.login(
        {"body":cred},
        function(response){  //success handler
            window.localStorage.setItem("session",JSON.stringify(response));
            startSession();

        },
        function(response){ //error handler
            popError(response.body.data.error[0].message);            
        });
}

function logout(){
    window.localStorage.clear();
    $.mobile.pageContainer.pagecontainer('change', '#login_page', {
        transition: 'flip',
        changeHash: false,
        reverse: true,
        showLoadMsg: true
    });
}

function slideDown(page,track){
    $.mobile.pageContainer.pagecontainer('change', '#'+page, {
                transition: 'slidedown',
                changeHash: track,
                reverse: true,
                showLoadMsg: true
            });
}

function slideUp(page,track){
    $.mobile.pageContainer.pagecontainer('change', '#'+page, {
                transition: 'slideup',
                changeHash: track,
                reverse: true,
                showLoadMsg: true
            });
}


function popError(message){
    $("#error-dialog-content").html(message);
    $('#errorpop').popup();
    $('#errorpop').popup('open', {transition: 'pop'});
}        

///////////////////////// GET FRIENDS LIST FUCNTION
function getFriendsList(id){
	console.log(window);
	window.df.apis.db.getRecordsByIds({"table_name":"ttfriends", "ids":id}, function (response) {
		console.log ('we are getting friends!!');
		console.log((response.record[0].friends));
		var friends = (response.record[0].friends);
		var friendsArray = friends.split(";");
		console.log (friendsArray);
		var numberOfFriends = friendsArray.length;

		for( var i =  0 ; i < numberOfFriends ; ++i){
			
			// create a <li> for each one.
			var listItem = document.createElement("li");

			// add the item text
			listItem.innerHTML = friendsArray[i];
			console.log(listItem);
			// add listItem to the listElement

			$('#friends_list').append(listItem);//.listview('refresh');

		}

	} ,function (response){popError("broblem");}
	);
	
}

function startSession(){
	app.session = JSON.parse(localStorage.session);
	console.log('session found in local storage, no need to log in');
	$.mobile.pageContainer.pagecontainer('change', '#trips_page', {
		transition: 'flip',
		changeHash: false,
		reverse: true,
		showLoadMsg: true
	});
	// setTimeout(getFriendsList(8),40000);
	setTimeout(function(){	
		getFriendsList(app.session.id);
    }, 1000);  	
}

var app = {
	"session":"",		// for session id
    // Application Constructor
    initialize: function() {
        $.mobile.allowCrossDomainPages = true;
        $.support.cors = true;
        this.bindEvents();
    },
    
    checkSession: function(){
        if(localStorage.getItem('session')!= undefined){
			startSession();
            return true;
        }else{
            console.log('no session found in local storage must log in');
            $.mobile.pageContainer.pagecontainer('change', '#login_page', {
                transition: 'flip',
                changeHash: false,
                reverse: true,
                showLoadMsg: true
            });
            return false;
        }
        
    },
    
//    // Bind Event Listeners
//    //
//    // Bind any events that are required on startup. Common events are:
//    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {

        $(document).on("mobileinit",this.onMobileinit);
        $(document).on("pagecreate","#login_page", this.onPageCreate);
        // $.mobile.pageContainer.pagecontainer("load", this.onPageCreate);
        document.addEventListener('deviceready', this.onDeviceReady, false);
        
        $(window).on( "navigate", function( event, data ) {
//        console.log( data.state.info );
//        console.log( data.state.direction );
//		  console.log( data.state.url );
//		  console.log( data.state.hash );
        });
    },
    
    // deviceready Event Handler
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
//        app.receivedEvent('deviceready');
        console.log('device is ready');
        
    },
    
    onPageCreate: function(event,data){
        console.log('page is created');
        app.checkSession();

    },
    
    onMobileinit: function(){
        console.log('mobile is init');
        $.mobile.phonegapNavigationEnabled = true;
        $.mobile.autoInitializePage = false;
    }
	
	

//    // Update DOM on a Received Event
//    receivedEvent: function(id) {
//        var parentElement = document.getElementById(id);
//        var listeningElement = parentElement.querySelector('.listening');
//        var receivedElement = parentElement.querySelector('.received');
//
//        listeningElement.setAttribute('style', 'display:none;');
//        receivedElement.setAttribute('style', 'display:block;');
//
//        console.log('Received Event: ' + id);
//    }

	//////////////////////////Start main 
}

app.initialize();



	

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
        }, function (response){
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
        function(response) {  //success handler
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


function popError(message){
    $("#error-dialog-content").html(message);
    $('#errorpop').popup();
    $('#errorpop').popup('open', {transition: 'pop'});
}        

///////////////////////// GET FRIENDS LIST FUCNTION
function getFriendsList(id){
	window.df.apis.db.getRecordsByIds({"table_name":"ttfriends", "ids":id}, 
        function (response) {
            console.log ('we are getting friends!!');
            var friends = (response.record[0].friends);
            var friendsArray = friends.split(";");
            console.log (friendsArray);
            var numberOfFriends = friendsArray.length;

            for( var i =  0 ; i < numberOfFriends ; ++i){

                // create a <li> for each one.
                var listItem = document.createElement("li");

                // add the item text
                listItem.innerHTML = friendsArray[i];
                // add listItem to the listElement

                $('#friends_list').append(listItem);//.listview('refresh');

            }

        },
        function (response){
            popError("broblem, can't get your friends!");
        }
    );
}
function checkSession(){
    var s = localStorage.getItem('session');
    if(s != undefined && s != null){
        app.session = JSON.parse(s);
        startSession();
        return true;
    }else{
        console.log('no session found in local storage must log in');
        $.mobile.pageContainer.pagecontainer('change', '#login_page', {
            transition: 'flip',
            changeHash: false,
            reverse: false,
            showLoadMsg: true
        });
        return false;
    }

}

function startSession(){
	
	console.log('old session found');
	$.mobile.pageContainer.pagecontainer('change', '#trips_page', {
		transition: 'flip',
		changeHash: false,
		reverse: false,
		showLoadMsg: true
	});
    getFriendsList(app.session.id);
}

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
    }
}

var app = {
	"session":"",		// for session id
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        console.log('Binding Events');
        $(document).on('deviceready', this.onDeviceReady);
        $(document).on("pageinit","#login_page", this.onLoginPage);
        $(document).on("pageinit", "#trip_page", this.onTripPage);
    },    
        
    onDeviceReady: function() {
        console.log('device is ready');
        $(document).on('apiReady',function(){
            console.log('api is ready');
            checkSession();
        });
    },
    
    onLoginPage: function(event,data){
        console.log('login page created');
        
    },
    
    onTripPage: function() {
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
        });
}

app.initialize();




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



function checkSession(){
    var s = localStorage.getItem('session');
    if(s != undefined && s != null){            // session is found 
        console.log('old session found');
        app.load();
        friends.load();
        trips.load();
        nav.flipPage('trips_page',false);
        return true;
    }else{                                      //no session is found, take use to login
        console.log('no session found in local storage must log in');
        nav.flipPage('login_page',false);
        return false;
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
    }
}

//////////////////////////////////////////////////
//               APP
//////////////////////////////////////////////////
var app = {
    activePage:"",
	"session":"",		// for session id
	
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    //create a session and store it to local storage
    login: function() {
        var email = $('#login_email').val();
        var password = $('#login_password').val();
        var cred = {"email": email,"password": password,"duration": 0};
        
        window.df.apis.user.login({"body":cred},
            function(response) {  //success handler
                window.localStorage.setItem("session",JSON.stringify(response));
                
                trips.getListFromDB(app.session.id);
                friends.getListFromDB(app.session.id);
                
                nav.flipPage('trips_page',false);

            },
            function(response){ //error handler
                popError(response.body.data.error[0].message);            
            });
    },
    load: function(){
        app.session = JSON.parse(localStorage.getItem('session'));

    },
    update: function(){
        trips.getListFromDB(app.session.id);
        friends.getListFromDB(app.session.id);
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
                popError("broblem, can't get your friends!");
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


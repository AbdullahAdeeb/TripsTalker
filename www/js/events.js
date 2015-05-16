
//////////////////////////////////////////////////
//               eventS
//////////////////////////////////////////////////
var events = {
    list: [],   //contains all the events
    messages:[],  // indexed my roomID
    openedEventIndex: -1,
    new: function(){
        var room = {"name": $(event_name).val(),"admin": session.data.id,"loc": $(event_location).val(),"members":[2,5,6],"connected":[],"disconnected":[]};

        //        var room = socket.createRoom(data);

        if (room.name === '') return;

        window.df.apis.mongo.createRecords({"table_name":"rooms", "body":{"record":[room]}}, function(response){
            console.log(JSON.stringify(response));
            room.id = response.record._id;
            window.localStorage.setItem('events',JSON.stringify(events.list));
            events.updateUI();
            nav.goTo('events_page',false);
        }, function(error){
            console.log(JSON.stringify(error));
            nav.popError('The server refused to create an event :(');
        });
    },

    // getListFromDB function gets the data from the database and store it in the device localStorage
    // return true on success; and calls events.updateUI()
    // return false on error
    getListFromDB: function(){
        $.mobile.loading("show");
        console.log('events.getlistfromDB');
//        var query = {$or: [{"admin": session.data.id},{"members": {$in:[session.data.id]}}]};  // the nosql query
        var query = "admin  = "+session.data.id+" or members = "+session.data.id;
        window.df.apis.mongo.getRecordsByFilter({"table_name":"rooms","filter": query},function(response){
            // on success
            console.log('respones:'+JSON.stringify(response.record));
            window.localStorage.setItem('events',JSON.stringify(response.record));
            events.updateUI();
            $.mobile.loading("hide");
            return true;
        },function(error){
            // on error
            $.mobile.loading("hide");
            console.log(JSON.stringify(error));
            nav.popError('Couldn\'t get your events from the server :(');
            return false;
        });
        //on success
        //        window.localStorage.setItem('events',JSON.stringify([{'id':''}]));
        //        events.load();

    },

    // updateUI function will load the data from localStorage to UI
    updateUI: function(){
        console.log('events.updateUI');
        events.list = JSON.parse(window.localStorage.getItem('events'));
        if(events.list == null){
            $('#events_list').html('');
            return;
        }
        var html = "";
        for(i=0;i<events.list.length;i++){
            var tripIndex = i;
            events.messages[events.list[i]._id] =[];
            // Create the list item for the event
            var li = document.createElement("li");
            li.id = "li-"+events.list[i]._id;
            var a = document.createElement("a");
            a.innerHTML="<img src='img/ants.png'></img><h1>"+events.list[i].name+"</h1><p>"+events.list[i].loc+"</p>";
            a.setAttribute("href","javascript:events.open('"+tripIndex+"');");
            li.appendChild(a);
            $('#events_list').append(li);
        }
        
        // refresh will happen when a page is opened, 
        // if the page is already open a manual refresh below will be preformed 
        if(app.activePage == "events_page"){
            $("#events_list").listview("refresh");
		
        }
    },
	
	///////////////////////////////////////ADDING THEM ////// 
	// Adds members to an event // WORKING ON IT
	addmembers: function(){
	
		for( var i =  0 ; i < friends.list.length ; i++){
            //Add the friends as an li into friends list ul
           members.list[i] = friends.list[i];

        }
		for(i=0;i<members.list.length;i++){
            html += "<li><a href=javascript:events.open('"+members.list[i].name+"');><img src='img/ants.png'></img><h1>"+members.list[i].name+"</h1><p>"+memebers.list[i].loc+"</p></a></li>";
        }
        $('#memebrs_list').html(html);
		
		//if(app.activePage == "addmember_page"){
          $("members_list").listview("refresh");
		 
		//if (app.activePage == "addmember_page"){
		//$("#members_list")=("#friends_list");
		//}
	},

    open: function(index){
        events.openedEventIndex = index;
        var eventID = events.list[index]._id;
        $("#event_page_header").html(events.list[index].name);
        $("#messages").html("");
        events.messages[eventID].forEach(function(msg, index, msgs){
            $('#messages').append($('<li>').text(msg.from.name+': '+msg.msg));
        });
        nav.goTo("event_page",true);
//        socket.openRoom(events.list[index]._id);
    },
    
    newMessage: function(data){
        if(events.messages[data.roomID] === undefined){
            events.messages[data.roomID] = [];
        }
        events.messages[data.roomID].push({"from":data.from,"msg":data.msg});
        
        if(events.openedEventIndex == -1){
        // ------ current view is event's list -----------
            // update the message list
            console.log("Notification: we got a message");
        }else{ 
        // ----- current view is the target event ---------
            if(events.list[events.openedEventIndex]._id == data.roomID){
//            $("#li-"+data.roomID).
                $('#messages').append($('<li>').text(data.from.name+': '+data.msg));  
                
        // ----- current view is another event -----------
            }else{
                console.log("we got a message in another event");
            }
        }
    }
}
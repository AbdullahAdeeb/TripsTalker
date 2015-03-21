
//////////////////////////////////////////////////
//               eventS
//////////////////////////////////////////////////
var events = {
    list: [],
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
        var query = {$or: [{"admin": session.data.id},{"members": {$in:[session.data.id]}}]};  // the nosql query
        
        window.df.apis.mongo.getRecords({"table_name":"rooms","body":{ "filter": query},function(response){
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
            nav.popError('Couldt get your events from the server :(');
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
            html += "<li><a href=javascript:events.open();><img src='img/ants.png'></img><h1>"+events.list[i].name+"</h1><p>"+events.list[i].loc+"</p></a></li>";
        }
        $("#events_list").html(html);

        // refresh will happen when a page is opened, 
        // if the page is already open a manual refresh below will be preformed 
        if(app.activePage == "events_page"){
            $("#events_list").listview("refresh");
        }

    },

    open: function(){
        console.log("opening an event");
        $("#event_page_header").html('name');
        nav.goTo("event_page",true);

    }
}
//////////////////////////////////////////////////
//               FRIENDS
//////////////////////////////////////////////////
var friends = {
    list:[],
    requests:[],
    //  GET FRIENDS LIST FUCNTIO

    // getListFromDB function gets the data from the database and store it in the device localStorage
    // return true on success; and calls friends.updateUI()
    // return false on error
    getListFromDB: function(id){
        console.log('friends.getListFromDB');
        var query = {'member': session.data.id};  // the nosql query
        window.df.apis.mongo.getRecords({"table_name":"friends","body": query},function(response){
            // on success
            $.mobile.loading("show");
            console.log('got friends from mongo');
            window.localStorage.setItem('friends',JSON.stringify(response.record[0].friends));
            window.localStorage.setItem('requests',JSON.stringify(response.record[0].requests));
            friends.updateUI();
            $.mobile.loading("hide");

            return true;
        },function(error){
            // on error
            $.mobile.loading("hide");
            console.log(JSON.stringify(error));
            nav.popError('Couldt get your friends from the server :(');
            return false;
        });
    }, 

    // updateUI function will load the data from localStorage to UI
    updateUI: function(){
        console.log('friends.updateUI');
        friends.list = JSON.parse(window.localStorage.getItem('friends'));
        friends.requests = JSON.parse(window.localStorage.getItem('requests'));
        // load friends list to UI
        var list="";
        for( var i =  0 ; i < friends.list.length ; i++){
            //Add the friends as an li into friends list ul
            list += ('<li><img src="img/ants.png"></img><h1>'+friends.list[i].name+'</h1></li>');

        }
        $('#friends_list').html(list); 

        if(app.activePage == "friends_page"){
            $("#friends_list").listview("refresh");
        }


        // load requests list to UI
        var req="";
        for( var i =  0 ; i < friends.requests.length ; i++){
            //Add the friends as an li into friends list ul
            req += ('<li><img src="img/ants.png"></img><h1>'+friends.requests[i].name+'</h1></li>');
        }
        $('#requests_list').html(req); 

        // refresh will happen when a page is opened, 
        // if the page is already open a manual refresh below will be preformed 
        if(app.activePage == "requests_page"){
            $("#requests_list").listview("refresh");
        }

    }

}
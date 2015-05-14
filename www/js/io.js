/*////////////////////////////////
//        SOCKET INIT
*//////////////////////////////////


//-----------END SOCKET INIT ------------- 




/*////////////////////////////////
//        SOCKET FUNCTIONS
*//////////////////////////////////

// connect and init when a session is started
var socket = {
    init : function(){  
        socket.io = io('http://ip.baramejapps.com:3000');
        socket.io.emit('register userID', {userID:session.data.id});
        console.log('io: register userID');
        bindListeners();
    },

    // register push token to SNS
    registerSNS : function(pushID){
        socket.io.emit('register pushID', {pushID:pushID});
        console.log('register >> pushID='+pushID);
    },

    openRoom : function(roomID){
        console.log("joing room = "+roomID)
        socket.io.emit('join room',{roomID:roomID});
        return true;
    }
}

    //socket.createRoom = function(data){
    ////    info is json that must contain {name: String, admin: int,details:[]}
    //    socket.emit('createRoom',JSON.stringify(data));
    //    console.log('io createRoom >> '+JSON.stringify(data));
    //    socket.on('roomCreated',function(room){
    //        events.list.push(room);
    //        window.localStorage.setItem('events',JSON.stringify(events.list));
    //        events.updateUI();
    //    });
    //}
//----------END SOCKET FUNCTIONS--------


/*////////////////////////////////
//        SOCKET LISTENERS
*//////////////////////////////////
var bindListeners = function(){
    
    //---------SEND LISTENER---------
    $('#msg_form').submit(function(){
        socket.io.emit('room message', {
            roomID:events.list[events.openedEventIndex]._id,
            msg:$('#msg').val(),
            from:{id:session.data.id,name:session.data.display_name}
        });
        $('#msg').val('');
       // alert("test submit");
        return false;
    });

    //---------RECEIVE LISTENER---------
    socket.io.on('room message',function(data){
        console.log('room='+data.roomID+'  msg='+data.msg);
        $('#messages').append($('<li>').text(data.from.name+': '+data.msg));

    });
}
//----------END SOCKET LISTENERS--------

var socket = io('http://52.0.36.197:3000');


socket.registerSNS = function(pushID, userID){
    socket.emit('registerSNS', pushID+';'+userID);
    console.log('registerSNS >> '+pushID+';'+userID);
}


//socket.createRoom = function(data){
////    info is json that must contain {name: String, admin: int,details:[]}
//    socket.emit('createRoom',JSON.stringify(data));
//    console.log('io createRoom >> '+JSON.stringify(data));
//    socket.on('roomCreated',function(room){
//        trips.list.push(room);
//        window.localStorage.setItem('trips',JSON.stringify(trips.list));
//        trips.updateUI();
//    });
//}

$('#msg_form').submit(function(){
    socket.emit('chat message', $('#msg').val());
    $('#msg').val('');
    return false;
});

socket.on('chat message',function(msg){
    console.log('msg='+msg);
    $('#messages').append($('<li>').text(msg));
});


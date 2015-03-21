var socket = io('http://52.0.36.197:3000');


socket.registerSNS = function(pushID, userID){
    socket.emit('register', pushID+';'+userID);
    console.log('register >> '+pushID+';'+userID);
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

$('#msg_form').submit(function(){
    socket.emit('room message', $('#msg').val());
   // socket.to('54f275828c632b65478b4568').emit('chat message',{msg:'this is my message u asshole'});
    $('#msg').val('');
   // alert("test submit");
    return false;
});

socket.on('chat message',function(msg){
    console.log('msg='+msg);
    $('#messages').append($('<li>').text(msg));
});


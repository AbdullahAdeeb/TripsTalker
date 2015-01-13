var socket = io('http://ec2-54-175-73-150.compute-1.amazonaws.com:3000');

$('#msg_form').submit(function(){
    socket.emit('chat message', $('#msg').val());
    $('#msg').val('');
    return false;
});

socket.on('chat message',function(msg){
    console.log('msg='+msg);
    $('#messages').append($('<li>').text(msg));
});
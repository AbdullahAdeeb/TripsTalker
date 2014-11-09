var socket = io('http://ec2-54-172-101-114.compute-1.amazonaws.com:3000');

$('#msg_form').submit(function(){
    socket.emit('chat message', $('#msg').val());
    $('#msg').val('');
    return false;
});

socket.on('chat message',function(msg){
    $('#messages').append($('<li>').text(msg));
});
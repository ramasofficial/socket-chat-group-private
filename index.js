$(function () {
    var socket = io();
    $('form').submit(function(){
        var send_to = '';
        if($('#peoples li.active').attr('data-id')) {
            send_to = $('#peoples li.active').attr('data-id');
        }
        console.log(send_to);

      socket.emit('chat message', {message: $('#m').val(), send_to: send_to, send_from: $('#socket_name').val()});
      $('#m').val('');
      return false;
    });

    // Prompt to enter name
    var name = prompt("Enter your name...");
    $('#messages').append("<li>You joined <strong>" + name + "</strong></li>");
    //socket.emit('name', name);
    socket.emit('name', name);
    $('#online_name').text(name);
    $('#socket_name').val(name);
    window.scrollTo(0, document.body.scrollHeight);

    socket.on('chat message', function(msg){
      $('#messages').append($('<li>').html(msg));
      window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on('name', function(name){
        $('#messages').append('<li>Joined <strong>' + name + '</strong></li>');
        window.scrollTo(0, document.body.scrollHeight);
    });


    socket.on('set_id', function(res){
        $('#socket').val(res.id);
    });
    
    socket.on('online', function(resp){
        var socket_id = $('#socket').val();
        console.log(socket_id);
        $('#peoples').html('');
        var html = '';
        $.each( resp.users, function( index, item ) {
            if(index != socket_id) {
                //$('#peoples').append('<li data-id="'+index+'">'+item+'</li>');
                html += '<li data-id="'+index+'">'+item+'</li>';
            }
        });
        $('#peoples').html(html);

        //$('#peoples').append('<li data-id="' + resp.id + '">' + resp.name + '</li>');
    });

    socket.on('offline', function(name){
        $('#messages').append('<li>Disconnected <strong>' + name + '</strong></li>');
        window.scrollTo(0, document.body.scrollHeight);
    });
});

var old_id;
$(document).on("click","#peoples li",function(e) {
    //console.log('click');
    $('#peoples li').removeClass('active');
    if(old_id != $(this).attr('data-id')) {
        $(this).addClass('active');
        old_id = $(this).attr('data-id');
    } else {
        old_id = '';
    }
    
});
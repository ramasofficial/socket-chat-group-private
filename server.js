var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var mysql = require('mysql');
var users = {};


// Mysql connection
var con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "socket_chat",
  debug: false,
});
con.connect(function(err) {
  if (err) throw err;
  //console.log("Connected!");
});


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    if(msg.send_to == '') {
        io.emit('chat message', '<strong>' + msg.send_from + ' say:</strong> ' + msg.message);
    } else {
        socket.broadcast.to(msg.send_to).emit('chat message', '<strong>' + msg.send_from + ' say (private):</strong> ' + msg.message);
        socket.emit('chat message', '<strong>' + msg.send_from + ' say (private):</strong> ' + msg.message);
    }
    console.log(msg);

    var sql = "INSERT INTO messages (id, message) VALUES ('', '" + msg.message + "')";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Record inserted");
    });

  });


  socket.on('name', function(name){
    socket.broadcast.emit('name', name);
    users[socket.id] = name;
    socket.emit('set_id', { id: socket.id });
    io.emit('online', { users: users });
  });

  // Socket connected and disconnected
  /*socket.on('connect', function () {
    socket.emit('online', { users: users, id: socket.id });
  });*/

  socket.on('disconnect', function () {
      socket.broadcast.emit('offline', users[socket.id]);
      delete users[socket.id];
      io.emit('online', { users: users });
  });
});


http.listen(port, function(){
  console.log('listening on *:' + port);
});

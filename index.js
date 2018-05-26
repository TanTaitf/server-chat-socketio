// khai bao tao server
var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var fs = require("fs");
server.listen(process.env.PORT || 3000);

console.log("server running.....");
// lắng nghe từ client
var buf = new Buffer(1024);
var message = "";
var arrayUser = [];
var tontai = false;
var ktketnoi = false;
var noderesult ;
var resultrom;
var chuoi = "";
var userOnl = [];

console.log("Chuan bi mo mot File dang ton tai");

fs.open('user.txt', 'r', function(err, fd) {
   if (err) {
       return console.error("Khong co file de mo");
   }
   console.log("File duoc mo thanh cong!");
   console.log("Chuan bi doc du lieu tu File da mo");
   fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
      if (err){
         console.log(err);
      }
      console.log(bytes + " bytes read");
      
      // In so luong byte da doc.
      if(bytes > 0){
         console.log(buf.slice(0, bytes).toString());
         buf = buf.slice(0, bytes).toString().split("\r");
         buf = buf.slice(0, bytes).toString().split("\n");
        chuoi = buf;
         arrayUser.push(chuoi);
         if (arrayUser != null){
		   	console.log("mang ton tai");
		   	for(i in arrayUser) {
		       	console.log(arrayUser[i]);
		    }
		   	//console.log(arrayUser);
		}else{
		   	console.log("mang khong co du lieu");
		}

        
      }
      
      // Dong mot File vua duoc mo.
      fs.close(fd, function(err){
         if (err){
            console.log(err);
         } 
         console.log("File duoc dong thanh cong.");
      });
      
   });
     
});

io.sockets.on('connection', function(socket){
	console.log("Có thiết bị vừa kết nối...");
	

	socket.on('client-register',function(data1){
		
		console.log(data1);
		// dang ky user moi
		if (arrayUser.indexOf(data1)== -1){
			arrayUser.push(data1);
			userOnl.push(data1);
			console.log("Dang ky thanh cong : " + data1);
			// ghi user new vào file
			fs.open('user.txt', 'a+', function(err, fd) {
			   if (err) {
			       return console.error("Khong co file de ghi");
			   }
			   console.log("File duoc mo thanh cong!");
			   console.log("Chuan bi ghi vao File");

				fs.appendFileSync('user.txt','\n'+data1);
				 // Dong mot File vua duoc mo.
		      	fs.close(fd, function(err){
		         if (err){
		            console.log(err);
		         } 
		         console.log("File duoc dong thanh cong.");
		      });
			      
			});
	
			//console.log(arrayUser);
			tontai = true;
			// gán tên user cho socket để dùng trong phần chat
			socket.un = data1;
			// gui mang danh sach user tra ve
			
			
		}else{
			console.log("Da ton tai user : "+ data1);
			tontai = false;
		}
		// tra ket qua dang ky ve user (1 user)
		socket.emit('server-result-register', {ketqua : tontai});

	});
	socket.on('Listuser',function(){
		io.sockets.emit('List-user', {danhsach : arrayUser} );
	});
	socket.on('nameUserOnline',function(nameuserOnl){
		userOnl.push(nameuserOnl);
		io.sockets.emit('nameUserOnline', {danhsach : userOnl} );
	});

	socket.on('client-send-chat',function(usernamegui,noidung,linkimg){

		console.log(socket.un + " : "+ noidung);
		message = socket.un + ":"+ noidung;

		resultrom = { usergui : usernamegui, messagenew : noidung, linkimg : linkimg};
		io.sockets.emit('server-send-chat',{
		 chatContent : resultrom});
	});

	// when the client emits 'typing', we broadcast it to others
	socket.on('typing', function (ten) {
	    io.sockets.emit('typing', {
	      username: ten
	    });
	});

	// when the client emits 'stop typing', we broadcast it to others
  	socket.on('stop typing', function (ten) {
	    io.sockets.emit('stop typing', {
	      username: ten
	    });
  	});

  	// when two client chat
	socket.on('ChatTwoClient',function(usernhan,usergui){
		
	   		if (arrayUser.indexOf(usergui)!= -1 && arrayUser.indexOf(usernhan)!= -1){
	   			ktketnoi = true;
	   			console.log("Ket noi thanh cong toi -> " + usernhan);
				// kiem tra ket noi 2 client
				socket.emit('ketnoi', {ketnoi : true});

	   		}
	   		// gui message giua 2 client			
				socket.on('message-two-client',function(usernamenhan, usernamegui,message_up,key, linkanh){
					console.log("ten user : " + usernamegui);
					console.log("new message : " + message_up);
					noderesult = { usergui : usernamegui, usernhan : usernamenhan, messagenew : message_up, key : usernamegui, linkimg : linkanh};
					io.sockets.emit('message-client-result',{node : noderesult});	
				});
	   		

	});

});
var net_server = require('net');
var dgram = require('dgram'); 
var udpClient = dgram.createSocket("udp4"); 

const MULTICAST_ADDRESS = "239.192.0.1";
const MULTICAST_PORT = 60001;
const MULTICAST_SRC_PORT = 60000;


const TCP_PORT = 9091;


udpClient.bind(MULTICAST_SRC_PORT, function () {         // Add the HOST_IP_ADDRESS for reliability
    udpClient.addMembership(MULTICAST_ADDRESS); 

});

 
 
 function sendNMEAMulticast(nmeaSentence) {
    var str450 = "UdPbC\\s:BB0003,n:0068*3C\\" + nmeaSentence;
    console.log( '|'+str450+'|' );
    udpClient.send(str450, 0, str450.length, MULTICAST_PORT, MULTICAST_ADDRESS);
 }




var _nmeaBuffer = [];

var server = net_server.createServer(function(client) {
  
    console.log('[TCP] Client connection: ');
    console.log('   local = %s:%s', client.localAddress, client.localPort);
    console.log('   remote = %s:%s', client.remoteAddress, client.remotePort);
    
    client.setTimeout(500);
    client.setEncoding('utf8');
    
    client.on('data', function(data) {

        var nmeaArray = data.split(/[\r\n]+/);
        nmeaArray.map((nmeaSentence)=>{
            if(nmeaSentence.length > 0)
                sendNMEAMulticast(nmeaSentence);
        })
    });
    
    client.on('end', function() {
        console.log('[TCP] Client disconnected');
    });
    
    client.on('error', function(err) {
        console.log('[TCP] Socket Error: ', JSON.stringify(err));
    });
    
    client.on('timeout', function() {
        console.log('[TCP] Socket Timed out');
    });
});
 
server.listen(TCP_PORT, function() {
    console.log('[TCP] Server listening: ' + JSON.stringify(server.address()));
    server.on('close', function(){
        console.log('[TCP] Server Terminated');
        
        console.log('   mqtt end');
        _mqttClient.end();

        console.log('   interval end');
        clearInterval(_interval);
    });
    server.on('error', function(err){
        console.log('[TCP] Server Error: ', JSON.stringify(err));
    });
});


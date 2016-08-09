var EpisodeMixin = {

    subclassName: "",

    session: undefined,
    publisher: undefined,
    pusher:undefined,
    channel:undefined,

    connected_streams: [],

    guests_in_line: [],
    guests_published: [],

    init: function(){

      CSEventManager.addListener("CONNECT_REMOTE_STREAM", this, "connectRemoteStreamHandler");

      var self = this;
      if(OT.checkSystemRequirements() == 1){
        self.session = OT.initSession( API_KEY, SESSION_ID );
        self.session.on("archiveStarted", self.archiveStarted);
        self.session.on("archiveStopped", self.archiveStopped);
        self.session.on("connectionCreated", self.connectionCreated);
        self.session.on("connectionDestroyed", self.connectionDestroyed);
        self.session.on("sessionConnected", self.sessionConnected);
        self.session.on("sessionDisconnected", self.sessionDisconnected);
        self.session.on("sessionReconnected", self.sessionReconnected);
        self.session.on("sessionReconnecting", self.sessionReconnecting);
        self.session.on("streamCreated", self.streamCreated);
        self.session.on("streamDestroyed", self.streamDestroyed);
        self.session.on("streamPropertyChanged", self.streamPropertyChanged);
        // self.session.on("signal", self.receiveGlobalSignal);
        // signal:type, for listening to specific signals...
        // self.session.on("signal:foo", self.signalFoo);
        self.session.on("mediaStopped", self.mediaStopped);

        self.connectLocalSession();

      }else{
        console.log("This browser does not support WebRTC");
      }
    },


    // Event Listeners


    archiveStarted: function(e){ },

    archiveStopped: function(e){ },

    mediaStopped:function(e){ },

    connectionCreated: function(e){
      var self = this;
      var newConnectionID = e.connection.id;
      if( newConnectionID != self.session.connection.id ){
        // console.log("remote connection", e);
      }else{
        // you're connected.
        // console.log("you're connected.", e);

        if(self.subclassName == "Backstage"){
          self.connectLocalStream();
        }
      }
    },

    connectionDestroyed: function(e){ },

    sessionConnected: function(e){ },

    sessionDisconnected: function(e) {
      if (e.reason == "networkDisconnected") {
        console.log("Your network connection terminated.")
      }
    },

    sessionReconnecting: function(e) { /* show "lag" message */ },

    sessionReconnected: function(e) { /* hide "lag" message */ },

    sendGlobalSignal: function(type, data){
      this.session.signal({
        type: type,
        data: data
      }, function(error){
        if( error ){
          console.log("Signal Error: ", error.message);
        }
      });
    },

    streamCreated: function(e){
      console.log("remote stream:", e.stream.id);
      var self = this;
      self.guests_in_line.push( e.stream );
      if(self.subclassName == "Backstage"){
        self.setState({ scope: this }); 
      }
    },

    streamDestroyed: function(e){
      var self = this;
      // console.log("before", self.guests_in_line);
      console.log("remote stream destroyed:", e.stream.id);
      for(var i=0; i<self.guests_in_line.length; i++) {
        if( self.guests_in_line[i].id == e.stream.id ){
          self.guests_in_line.splice(i,1); 
        }
      }
      if(self.subclassName == "Backstage"){
        self.setState({ scope: this }); 
      }
    },

    streamPropertyChanged: function(e){ },


    // Local User Methods


    connectLocalSession: function(){
      var self = this;
      self.session.connect(SESSION_TOKEN, function(error) {
        if (error) {
          console.log("Error connecting: ", error.code, error.message);
        }
      });
    },

    disconnectLocalSession: function(){
      var self = this;
      self.session.disconnect();
    },

    connectLocalStream: function(){
      var self = this;
      // console.log("current connection", e);
      if (self.session.capabilities.publish == 1) {
        self.publisher = OT.initPublisher("your-stream", {publishAudio:false, publishVideo:true}, function(error){
          if (error) {
            // The client cannot publish.
            // You may want to notify the user.
          } else {
            self.session.publish(self.publisher, function(error) {
              if (error) {
                console.log(error);
              } else {
                // console.log('Publishing current user stream.');
                console.log( "you're connected: streamId[" + self.publisher.streamId + "]");
              }
            });
          }
        });
      } else {
          // The client cannot publish.
          // You may want to notify the user.
      }
    },

    disconnectLocalStream: function(){
      var self = this;
      self.session.unpublish( self.publisher);
    },


    connectRemoteStreamHandler: function( data ){
      // console.log("connect remote handler")
      this.connectToRemoteStream(data.streamId, data.elementId );
    },

    connectToRemoteStream: function( streamId, elementId ){
      var self = this;
      var stream = self.session.streams.get(streamId);
      self.session.subscribe(stream, elementId);
    },





    connectToStreams:function( connectionIds ){
      // var self = this;
      // for(var i=0; i<self.connections.length; i++){
      //   for(var j=0; j<connectionIds.length; j++){
      //     var connectionId = connectionIds[j];
      //     if(self.streams[i].connection.id == connectionId){
      //       // console.log(self.connections[i])
      //       var newConnectionID = self.streams[i].connection.id
      //       $("#episode-streams").append("<div id='"+newConnectionID+"'></div>");
      //       self.session.subscribe(self.connections[i], newConnectionID);   
      //     }
      //   }
      // }
    }
  
};

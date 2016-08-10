var EpisodeMixin = {

  subclassName: "",

  session: undefined,
  publisher: undefined,
  stream_id: undefined,
  identity: undefined,

  connected_streams: [],
  published_streams: [],

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

  logSessionInfo: function(){
    console.log("::::: LOG CONNECTED USERS :::::");
    console.log(" --- Connected Streams");
    for(var i=0; i < this.connected_streams.length; i++){
      var stream = this.connected_streams[i];
      console.log( " -> stream_id:", stream.id, "identity:", Params.query( stream.connection.data ).email );
    }
    console.log(" --- Published Streams");
    for(var i=0; i < this.published_streams.length; i++){
      var stream = this.published_streams[i];
      console.log( " -> stream_id:", stream.id, "identity:", Params.query( stream.connection.data ).email );
    }
  },


  // Event Listeners

  archiveStarted: function(e){ },

  archiveStopped: function(e){ },

  mediaStopped:function(e){ },

  sessionConnected: function(e){ 
    // console.log("sessionConnected", e.target.sessionId);
  },

  sessionDisconnected: function(e) {
    // console.log("sessionDisconnected", e.target.sessionId);
    if (e.reason == "networkDisconnected") {
      console.log("Your network connection terminated.")
    }
  },

  sessionReconnecting: function(e) { 
    // console.log("sessionReconnecting", e);
  },

  sessionReconnected: function(e) {
    // console.log("sessionReconnecting", e);
  },

  connectionCreated: function(e){
    var newConnectionID = e.connection.id;
    if( newConnectionID == this.session.connection.id ){
      if(this.subclassName == "Backstage"){
        this.connectLocalStream();
      }
    }else{
      // console.log("connectionCreated", e.connection.data);
    }
  },

  connectionDestroyed: function(e){
    var self = this;
    var identity = Params.query( e.connection.data ).email;
    self.sendGlobalSignal("GUEST_LEFT_ROOM", identity); 
  },

  sendDirectSignal: function(identity, type, data){
    console.log(this.session)
    // var connectionObj = this.session.
    // // var connectionObject = this.session.getConnection()
    // this.session.signal({
    //   to: connectionObject
    //   type: type,
    //   data: data
    // }, function(error){
    //   if( error ){
    //     console.log("Signal Error: ", error.message);
    //   }
    // });
  },

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

  addStreamReference: function( stream ){
    if(stream){
      if(this.connected_streams == undefined) this.connected_streams = [];
      this.connected_streams.push( stream );
      this.connected_streams = $.unique(this.connected_streams); // remove dups 
    }
  },

  removeStreamReference: function( stream ){
    if(stream){
      for(var i=0; i < this.connected_streams.length; i++) {
        if( this.connected_streams[i].id == stream.id ){
          this.connected_streams.splice(i,1);
        }  
      } 
      for(var i=0; i < this.published_streams.length; i++){
        if( this.published_streams[i].id == stream.id ){
          this.published_streams.splice(i,1);
        }  
      }
      if(this.subclassName == "Backstage"){
        this.removeGuestFromLine(stream.id);
      } 
    }
  },

  getStreamByIdentity: function( identity ){
    for(var i=0; i < this.connected_streams.length; i++) {
      var stream = this.connected_streams[i];
      var stream_identity = Params.query( stream.connection.data ).email;
      if(identity == stream_identity) return stream;
    }
  },

  getStreamById: function( streamId ){
    for(var i=0; i < this.connected_streams.length; i++) {
      if(streamId == this.connected_streams[i].id) return this.connected_streams[i];
    }
  },

  streamCreated: function(e){
    // console.log("streamCreated", e.stream.connection.data);
    this.addStreamReference( e.stream );
  },

  streamDestroyed: function(e){
    // console.log("streamDestroyed", e.stream.connection.data);
    this.removeStreamReference( e.stream );

    if(this.subclassName == "Backstage"){
      this.setState({});
    }
  },

  streamPropertyChanged: function(e){ },


  // Local User Methods

  connectLocalSession: function(){
    var self = this;
    self.session.connect(SESSION_TOKEN, function(error) {
      if (error) {
        console.log("Error connecting: ", error.code, error.message);
      }else{
        // set self identity and then announce you're here..
        self.identity = Params.query(self.session.connection.data ).email;
        self.sendGlobalSignal("GUEST_JOINED_ROOM", self.identity); 
      }
    });
  },

  disconnectLocalSession: function(){
    this.removeStreamReference(this.session.stream);
    this.session.disconnect();
  },

  connectLocalStream: function(){
    var self = this;
    // console.log("current connection", e);
    if (self.session.capabilities.publish == 1) {
      // preview stream..
      $("#your-stream").append("<div id='your-stream-elem'></div>");
      // preview stream..
      self.publisher = OT.initPublisher('your-stream-elem', {publishAudio:false, publishVideo:true}, function(error){
        if (error) {
          // The client cannot publish.
          // You may want to notify the user.
        } else {
          self.session.publish(self.publisher, function(error) {
            if (error) {
              console.log(error);
            } else {
              self.stream_id = self.publisher.stream.id;
              // console.log(self.identity)
              self.addStreamReference( self.publisher.stream );

              // when publisher object is ready, tell the backstage manager you're here..
              if(self.subclassName == "Public"){
                // console.log(self);
                self.sendGlobalSignal("GUEST_JOINED_LINE", self.stream_id);  
                // set the state to "connected and watching".
                self.setState({guest_state: "IN_LINE"}); 
              }
            }
          });
        }
      });
    } else {
        // The client cannot publish.
        // You may want to notify the user.
        console.log("WebRTC not available..")
    }
  },

  disconnectLocalStream: function(){
    this.removeStreamReference( this.publisher.stream );
    this.session.unpublish( this.publisher);
  },


  connectRemoteStreamHandler: function( data ){
    this.connectToRemoteStream(data.streamId, data.elementId);
  },

  connectToRemoteStream: function( streamId, elementId ){

    var stream = undefined;
    for( var s in this.connected_streams ){
      var loopStream = this.connected_streams[s];
      if(loopStream){
        if( streamId == loopStream.id ) {
          stream = loopStream;
          break;
        }
      }
    }

    if(stream){
      var streamOptions = {
        subscribeToVideo: true,
        subscribeToAudio: false,
        width: "100%",
        height: "100%"
      }
      this.session.subscribe(stream, elementId, streamOptions); 
    }
  },

  removeAllStreams:function(){
    this.connected_streams = [].concat();
    this.published_streams = [].concat();
    if(this.subclassName == "Backstage"){
      this.guests_in_line = [].concat();
    }
  }
};

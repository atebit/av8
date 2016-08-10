var EpisodeMixin = {

  subclassName: "",

  session: undefined,
  publisher: undefined,
  stream_id: undefined,
  identity: undefined,
  role: undefined,
  broadcast_status: "idle",

  // users:[{
  //   connection: connectionObject,
  //   stream: streamObject,
  //   identity: email,
  //   role: "GUEST / ADMIN / HOST / CELEBRITY",
  //   session_status: " CONNECTED / STREAMING / IN_LINE / PREP_TO_BROADCAST / BROADCASTING / BANNED",
  //   av_status: "ALL / VIDEO_ONLY / AUDIO_ONLY",
  // }],

  users: [],

  // connected_streams: [],
  // published_streams: [],

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
      // start the app..
      self.connectLocalSession();
    }else{
      console.log("This browser does not support WebRTC");
    }
  },

  // Session Methods

  connectLocalSession: function(){
    var self = this;
    self.session.connect(SESSION_TOKEN, function(error) {
      if (error) {
        console.log("Error connecting: ", error.code, error.message);
      }else{
        // success
      }
    });
  },

  disconnectLocalSession: function(){
    this.removeStreamReference(this.session.stream);
    this.session.disconnect();
  },


  // Session Events

  sessionConnected: function(e){ 
    // console.log("sessionConnected", e.target.sessionId);
  },

  sessionDisconnected: function(e) {
    // console.log("sessionDisconnected", e.target.sessionId);
    if (e.reason == "networkDisconnected") {
      console.log("Your network connection terminated.")
    }
  },
  sessionReconnecting: function(e) {  /* console.log("sessionReconnecting", e); */ },
  sessionReconnected: function(e) { /* console.log("sessionReconnecting", e); */ },


  // Archive Events

  archiveStarted: function(e){ },
  archiveStopped: function(e){ },

  mediaStopped:function(e){ },


  // Connection Events
  connectionCreated: function(e){
    // console.log("connection created", e.connection);
    this.identity = Params.query(this.session.connection.data ).email;
    this.addNewUser( e.connection );
  },

  connectionDestroyed: function(e){
    console.log("connection destroyed", e.connection);
    var identity = Params.query(e.connection.data).email;
    var role = Params.query(e.connection.data).role;
    this.removeUser( identity );
    if( role == "admin" ){
      
    }
  },


  // User Table Methods
  addNewUser: function( connection ){
    // if no reference object, create it.
    if(this.users == undefined) this.users = [];
    // create a reference to this user.
    var identity = Params.query(connection.data).email;
    var role = Params.query(connection.data).role;
    var user = {
      identity: identity,
      role: role,
      connection: connection,
      session_status: "connected",
      player_status: "idle",
      av_stats: "all"
    };
    // add to the users table
    this.users.push( user );
    // is this the current user?
    var newConnectionID = connection.id;
    if( newConnectionID == this.session.connection.id ){
      // yes
      if(this.subclassName == "Backstage"){
        // this is backstage, create a local stream immediately.
        this.connectLocalStream();
      }else{
        // if not, announce that you're here..
        this.sendGlobalSignal("GUEST_JOINED_ROOM", identity);
      }
    }else{
      // no
    }
  },

  // update user session status
  updateUserSessionStatus: function( identity, session_status ){
    // remove the guest from the users table..
    for(var i=0; i < this.users.length; i++){
      var user = this.users[i];
      var user_identity = user.identity;
      if( identity == user_identity ){
        user.session_status = session_status;
      }
    }

    // if we're the moderator, send a signal directly to the person who needs updated..
    if( this.subclassName == "Backstage"){
      if( identity != this.identity ){
        // this.sendDirectSignal( identity, "UPDATE_SESSION_STATUS", session_status );  
      }
    }
  },

  // add stream object..
  addStreamToUser: function( identity, stream ){
    console.log("add stream to user", identity)
    // remove the guest from the users table..
    for(var i=0; i < this.users.length; i++){
      var user = this.users[i];
      var user_identity = user.identity;
      if( identity == user_identity ){
        user.stream = stream;
      }
    }
    this.updateUserSessionStatus( identity, "streaming" );
  },

  // remove stream object..
  removeStreamFromUser: function( identity ){
    // remove the guest from the users table..
    for(var i=0; i < this.users.length; i++){
      var user = this.users[i];
      var user_identity = user.identity;
      if( identity == user_identity ){
        user.stream = undefined;
      }
    }
    this.updateUserSessionStatus( identity, "connected" );
  },

  removeUser: function( identity ){
    // remove the guest from the users table..
    for(var i=0; i < this.users.length; i++){
      var user = this.users[i];
      var user_identity = user.identity;
      if( identity == user_identity ){
        this.users.splice(i,1);
      }
    }
    // alert the room
    this.sendGlobalSignal("GUEST_LEFT_ROOM", identity); 
  },

  getUserByIdentity: function( identity ){
    // remove the guest from the users table..
    for(var i=0; i < this.users.length; i++){
      var user = this.users[i];
      var user_identity = user.identity;
      if( identity == user_identity ){
        return user;
      }
    }
  },


  // Stream Events

  streamCreated: function(e){
    // console.log("stream created", identity);
    var identity = Params.query(e.stream.connection.data).email;
    this.addStreamToUser( identity, e.stream );
  },

  streamDestroyed: function(e){
    // console.log("stream destroyed", identity);
    var identity = Params.query(e.stream.connection.data).email;
    this.removeStreamFromUser( identity );
    // reset state..
    if(this.subclassName == "Backstage"){
      this.setState({});
    }
  },

  streamPropertyChanged: function(e){ },



  // Send Signals

  sendDirectSignal: function(identity, type, data){

    // console.log("send direct signal to:", identity );

    var user = this.getUserByIdentity( identity );

    data.identity = user.identity;

    this.session.signal({
      to: user.connection,
      type: type,
      data: data
    }, function(error){
      if( error ){
        console.log("Signal Error: ", error.message);
      }
    });
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

  // Local User Methods

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
              // update user object with new 
              var identity = self.identity;
              self.updateUserSessionStatus( identity, "streaming" );
              self.addStreamToUser( identity, self.publisher.stream );

              // if user is public user, send a signal they joined the line and reset this page to that state.
              if(self.subclassName == "Public"){
                self.sendGlobalSignal("GUEST_JOINED_LINE", identity);  
                self.updateUserSessionStatus( identity, "in_line" );
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
    var identity = this.identity;
    this.updateUserSessionStatus( identity, "connected" );
    this.removeStreamFromUser( identity );
    this.session.unpublish( this.publisher );
  },

  connectRemoteStreamHandler: function( data ){
    this.connectToRemoteStream( data.identity, data.elementId );
  },

  connectToRemoteStream: function( identity, elementId ){

    var user = this.getUserByIdentity( identity );

    if(user.player_status != "mounted"){
      user.player_status = "mounted";

      var stream = user.stream;
      console.log("connect to stream", identity)

      if(stream){
        var streamOptions = {
          subscribeToVideo: true,
          subscribeToAudio: false,
          width: "100%",
          height: "100%"
        }
        this.session.subscribe(stream, elementId, streamOptions); 
      }

    }
  }

};

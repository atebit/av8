var EpisodeMixin = {

  subclassName: "",

  episodeData: undefined,

  // episodeData: {
  //   episode_state: CONNECTED / STREAMING / IN_LINE / PREP_TO_BROADCAST / BROADCASTING / BANNED
  //   guest_state: BROADCASTING / WATCHING
  //   users: the current users array
  //   controls_view_state: HIDDEN / CHAT / GUESTLIST
  // }

  // users:[{
  //   connection: connectionObject,
  //   stream: streamObject,
  //   identity: email,
  //   role: "GUEST / ADMIN / HOST / CELEBRITY",
  //   live_state: " CONNECTED / STREAMING / IN_LINE / PREP_TO_BROADCAST / BROADCASTING / BANNED",
  //   av_status: "ALL / VIDEO_ONLY / AUDIO_ONLY",
  // }],

  session: undefined,
  publisher: undefined,
  stream_id: undefined,
  broadcast_status: "idle", // " CONNECTED / STREAMING / IN_LINE / PREP_TO_BROADCAST / BROADCASTING / BANNED"


  // when willMount is called, setup the episodeData object
  preInitialize: function( params ){

    // setup new episodeData object.
    this.episodeData = {
      subclassName: params.subclass_name,
      episode_id: -1,
      identity: "NOT SET",
      role: "NOT SET",
      episode_state: params.episode_state,
      guest_state: "NOT SET",
      users: [],
      controls_view_state: "HIDDEN"
    }

    // if there are users in the session already, add them..

    if( this.props.attendees.length ){
      for( var i=0; i < this.props.attendees.length; i++){
        var attendee = this.props.attendees[i];
        this.addNewUser(attendee.email, {
          role: attendee.role,
          guest_state: attendee.guest_state,
          player_status: "idle",
          av_stats: "all"
        });
      }
    }
    console.log("preInit", this.episodeData)
  },

  // when we're ready, call the init function to get Tokbox rolling.
  initialize: function(){
    // if there are users already in the session, prepopulate the users table.
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

      // console.log("onload_props", this.props);
      self.episodeData.episode_id = self.props.episode_id;
      self.episodeData.episode_state = self.props.episode_state;

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
        // successful connection established..
        self.episodeData.identity = Params.query(self.session.connection.data).email;

        if( self.subclassName == "Backstage" ){
          // if this is the episode moderator, let everyone know to fetch updates from the server..
          self.episodeData.guest_state = "CONNECTED";
          self.sendGlobalSignal("MODERATOR_CONNECTED", self.episodeData.identity); 
        }
      }
    });
  },

  disconnectLocalSession: function(){
    this.removeStreamReference(this.session.stream);
    this.session.disconnect();
  },


  // Session Events

  sessionConnected: function(e){ 
    // console.log("sessionConnected", e.target);
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
    this.episodeData.identity = Params.query(this.session.connection.data ).email;
    this.addUserConnection( e.connection );
  },

  connectionDestroyed: function(e){
    // console.log("connection destroyed", e.connection);
    var identity = Params.query(e.connection.data).email;
    var role = Params.query(e.connection.data).role;
    this.removeUser( identity );
    if( role == "admin" ){
      
    }else{
      this.updateUserGuestState(identity, "DISCONNECTED");
    }
  },

  getEpisodeState: function(){
    var self = this;
    var api = '/api/episodes/'+self.episode_id+'/get_episode_state';
    self.serverRequest = $.getJSON(api, function ( data ) {
      console.log( "episode state received: ", data );
      // TODO: add some error catching...
      // this.setState({ comments });
    }.bind(self));
  },

  addNewUser: function( identity, params ){
    if(!identity){
      throw new Error("AV8 Error: An identity is required to add a New User");
    }

    // check to see if there's already a user with this identity
    var user = this.getUserByIdentity( identity );
    if( ! user ){
      // set new props
      user = {
        identity: identity,
        role: "not_set",
        connection: undefined,
        guest_state: "not_set",
        player_status: "not_set",
        av_stats: "not_set"
      };
      this.episodeData.users.push(user);
    }
    // set the roles.
    if(params.role) user.role = params.role;
    if(params.connection) user.connection = params.connection;
    if(params.guest_state) user.guest_state = params.guest_state;
    if(params.player_status) user.player_status = params.player_status;
    if(params.av_stats) user.av_stats = params.av_stats;
  },


  // User Table Methods
  addUserConnection: function( connection ){
    // if no reference object, create it.
    if(this.episodeData.users == undefined) this.episodeData.users = [];
    // create a reference to this user.
    var identity = Params.query(connection.data).email;
    var userObject = this.getUserByIdentity( identity );

    if( userObject ){
      userObject.connection = connection;
    }else{
      this.addNewUser(identity, {
        role: Params.query(connection.data).role,
        connection: connection,
        guest_state: "CONNECTED",
        player_status: "idle",
        av_stats: "all"
      });

      // add to the users table
      // is this the current user?
      var newConnectionID = connection.id;
      if( newConnectionID == this.session.connection.id ){
        // yes
        if(this.episodeData.subclassName == "Backstage"){
          // this is backstage, create a local stream immediately.
          this.connectLocalStream();
        }else{
          // if not, announce that you're here..
          this.sendGlobalSignal("GUEST_JOINED_ROOM", identity);
        }
      }else{
        // no
      }
    }
  },

  // update user session status
  updateUserGuestState: function( identity, guest_state ){
    console.log("updateUserGuestState::BEFORE LOOP", identity, guest_state)

    var updated_attendees = [];
    var changed_user = undefined;
    // loop through, find and change
    for(var i=0; i < this.episodeData.users.length; i++){
      var user = this.episodeData.users[i];
      var user_identity = user.identity;
      if( identity == user_identity ){
        // set it locally
        user.guest_state = guest_state;
        changed_user = user;
        // pass it to the props for db
        updated_attendees.push({
          user_id: Params.query(user.connection.data).user_id,
          identity: user.identity,
          live_state: user.guest_state,
          av_state: user.av_state
        });
      }
    }

    // if we're the moderator, send a signal directly to the person who needs updated..
    if( this.episodeData.subclassName == "Backstage"){
      // save the users current states to the database
      var self = this;
      var api = '/api/episodes/'+self.episodeData.episode_id+'/update_rsvps';
      var method = "post";
      var data = { rsvps: JSON.stringify(updated_attendees) };

      self.serverRequest = $.ajax({
        url: api,
        method: method,
        data: data
      }).complete(function ( response ) {
        // console.log("updated user session status, api response: ", response );
      });
    }
    console.log("updateUserGuestState::AFTER LOOP", changed_user)
  },

  // add stream object..
  addStreamToUser: function( identity, stream ){
    console.log("addStreamToUser", identity);
    
    // remove the guest from the users table..
    for(var i=0; i < this.episodeData.users.length; i++){
      var user = this.episodeData.users[i];
      var user_identity = user.identity;
      if( identity == user_identity ){
        user.stream = stream;
      }
    }
    // this.updateUserGuestState( identity, "STREAMING" );
  },

  // remove stream object..
  removeStreamFromUser: function( identity ){
    console.log("removeStreamFromUser", identity);
    // remove the guest from the users table..
    for(var i=0; i < this.episodeData.users.length; i++){
      var user = this.episodeData.users[i];
      var user_identity = user.identity;
      if( identity == user_identity ){
        user.stream = undefined;
      }
    }
    // this.updateUserGuestState( identity, "CONNECTED" );
  },

  removeUser: function( identity ){
    console.log("removeUser", identity);
    // remove the guest from the users table..
    for(var i=0; i < this.episodeData.users.length; i++){
      var user = this.episodeData.users[i];
      var user_identity = user.identity;
      if( identity == user_identity ){
        this.episodeData.users.splice(i,1);
      }
    }
    // alert the room
    this.sendGlobalSignal("GUEST_LEFT_ROOM", identity); 
  },

  getUserByIdentity: function( identity ){
    // remove the guest from the users table..
    for(var i=0; i < this.episodeData.users.length; i++){
      var user = this.episodeData.users[i];
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
    if(this.episodeData.subclassName == "Backstage"){
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
              var identity = self.episodeData.identity;

              // console.log("connect local stream")
              self.addStreamToUser( identity, self.publisher.stream );

              // if user is public user, send a signal they joined the line and reset this page to that state.
              if(self.subclassName == "Public"){
                self.sendGlobalSignal("GUEST_JOINED_LINE", identity);  
                self.updateUserGuestState( identity, "IN_LINE" );
                // set the state to "connected and watching".
                self.episodeData.guest_state = "IN_LINE";
                self.setState({});
              }else if( self.subclassName == "Backstage"){
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
    // console.log("disconnect local stream");
    var identity = this.episodeData.identity;
    if( identity && this.publisher ){
      this.updateUserGuestState( identity, "CONNECTED" );
      this.removeStreamFromUser( identity );
      this.session.unpublish( this.publisher ); 
    }
  },

  removeAllStreams: function(){
    for(var j=0; j < this.episodeData.users.length; j++){
      var user = this.episodeData.users[j];
      if( user.guest_state == "BROADCASTING" ){
        user.guest_state = "REMOVED";
        user.player_status = "REMOVED";
      }
    }
  },

  connectRemoteStreamHandler: function( data ){
    this.connectToRemoteStream( data.identity, data.elementId );
  },

  connectToRemoteStream: function( identity, elementId ){

    var user = this.getUserByIdentity( identity );

    if(user.player_status != "MOUNTED"){
      user.player_status = "MOUNTED";
      var stream = user.stream;
      // console.log("connect to stream", identity)
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

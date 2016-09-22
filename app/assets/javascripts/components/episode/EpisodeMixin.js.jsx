var EpisodeMixin = {

  subclassName: "",

  episodeData: undefined,

  session: undefined,
  publisher: undefined,
  stream_id: undefined,
  broadcast_status: "idle",


  // when willMount is called, setup the episodeData object
  preInitialize: function( params ){
    var self = this;
    $(window).resize(function(){
      self.resizePlayer();
    });

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
    // console.log("preInit", this.episodeData)
  },

  // when we're ready, call the init function to get Tokbox rolling.
  initialize: function(){
    //
    CSEventManager.addListener("CONNECT_REMOTE_STREAM", this, "connectRemoteStreamHandler");
    //
    CSEventManager.addListener("CHAT_MESSAGE_SAVED", this, "onChatMessageSaved");

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
      self.episodeData.episode_id = self.props.episode_id;
      self.episodeData.episode_state = self.props.episode_state;
      //
      self.connectLocalSession();
    }else{
      console.log("This browser does not support WebRTC");

    }
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

  streamPropertyChanged: function(e){ /*console.log("OT::StreamPropertyChanged")*/ },

  // Archive Events

  archiveStarted: function(e){ /*console.log("OT::ARCHIVE STARTED");*/ },
  archiveStopped: function(e){ /*console.log("OT::ARCHIVE STARTED");*/ },

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


  // Stream Events
  streamCreated: function(e){
    var user = this.getUserByIdentity( Params.query(e.stream.connection.data).email );
    // console.log("streamCreated", user);
    this.addStreamToUser( user.identity, e.stream );
  },

  streamDestroyed: function(e){
    // console.log("stream destroyed", identity);
    var identity = Params.query(e.stream.connection.data).email;
    this.removeStreamFromUser( identity );
    // reset state..
    // if(this.episodeData.subclassName == "Backstage"){
    //   this.setState({});
    // }
  },

  getEpisodeState: function(){
    var self = this;
    var api = '/api/episodes/'+self.episode_id+'/get_episode_state';
    self.serverRequest = $.getJSON(api, function ( data ) {
      // console.log( "episode state received: ", data );
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
        stream: undefined,
        guest_state: "not_set",
        player_status: "not_set",
        av_stats: "not_set",
        videoElement: undefined
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
    var user = this.getUserByIdentity( identity );

    if( user ){
      user.connection = connection;
      if( user.guest_state != "BROADCASTING" ){
        this.updateUserGuestState( identity, "CONNECTED" ); 
      }else{
        // user.guest_state = "SHOULD_BROADCAST"
        console.log( user.identity, "should be broadcasting...");
      }
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
          // set this user as the moderator of the show.
          user.is_moderator = true;
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
    // console.log("updateUserGuestState", identity, guest_state)

    var updated_attendees = [];
    // loop through, find and change
    for(var i=0; i < this.episodeData.users.length; i++){
      var user = this.episodeData.users[i];
      var user_identity = user.identity;
      if( identity == user_identity ){
        // set it locally
        user.guest_state = guest_state;

        // overrides..
        switch( guest_state ){
          case "ADDED_TO_BROADCAST":
            user.player_status = "CAN_MOUNT";
            user.guest_state = "BROADCASTING";
            break;
          case "REMOVED_FROM_LINE":
          case "REMOVED_FROM_BROADCAST":
            user.player_status = "REMOVED";
            user.guest_state = "WATCHING";
            break;
        }

        // pass it to the props for db
        if(user.connection){
          updated_attendees.push({
            user_id: Params.query(user.connection.data).user_id,
            identity: user.identity,
            live_state: user.guest_state,
            av_state: user.av_state
          }); 
        }

        // is it the current_user?
        if( identity == this.episodeData.identity ){
          // console.log("current user")
          this.episodeData.guest_state = user.guest_state;
        }
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
        // console.log("UPDATE GUEST_STATE: ", response );
      });
    }
  },

  // add stream object..
  addStreamToUser: function( identity, stream ){
    // console.log("addStreamToUser", identity);  
    // remove the guest from the users table..
    var user = this.getUserByIdentity( identity );
    if( user ){
      user.stream = stream;
    
      if( this.episodeData.subclassName == "Public" ){
        if(this.episodeData.episode_state == "LIVE"){
          if(user.videoElement == undefined){
            this.connectToRemoteStream( identity ); 
          }
        }
      }

    }else{
      console.log("Couldn't add stream: no user found.");
    }
  },

  addVideoElementToUser: function( identity, video ){
    var user = this.getUserByIdentity( identity );
    // console.log("addVideoElementToUser:", identity);
    // add new one
    user.videoElement = video;

    if( this.episodeData.subclassName == "Public" ){
      if(this.episodeData.episode_state == "LIVE"){
        // the episode is already going..
        if( user.videoElement ){
          this.requestStateChange("video element added and ready to stream");
        }
      }
    }else{
      // the episode is already going..
      if( user.videoElement ){
        this.requestStateChange("video element added and ready to stream");
      }
      
    }
  },




  validateUserCanBroadcast: function( identity ){
    var user = this.getUserByIdentity( identity );
    if( !user ) return false;
    // console.log("validate user broadcast:", user)
    if(user.guest_state != "BROADCASTING") return false;
    if(user.stream == undefined) return false;
    if(user.connection == undefined) return false;
    if(user.videoElement == undefined) return false;
    return true;
  },


  // remove stream object..
  removeStreamFromUser: function( identity ){
    // console.log("removeStreamFromUser", identity);
    // remove the guest from the users table..
    var user = this.getUserByIdentity( identity );
    if( user ){
      user.stream = undefined;
      if(user.guest_state == "BROADCASTING"){
        this.updateUserGuestState( identity, "REMOVED_FROM_BROADCAST" );
        // this.setState({});
      }
    }else{
      console.log("Couldn't add stream: no user found.");
    }
  },

  removeUser: function( identity ){
    // console.log("removeUser", identity);
    // remove the guest from the users table..
    for(var i=0; i < this.episodeData.users.length; i++){
      var user = this.episodeData.users[i];
      var user_identity = user.identity;
      if( identity == user_identity ){
        this.updateUserGuestState( identity, "DISCONNECTED" );
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


  // Send Signals


  // when the user posts a chat thread, send a signal to everyone to reload the chat stream..
  onChatMessageSaved: function(){
    this.sendGlobalSignal("CHAT_MESSAGE_SAVED", "");
  },


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

  // Session Methods

  connectLocalSession: function(){
    // console.log("connectLocalSession")
    var self = this;
    self.session.connect(SESSION_TOKEN, function(error) {
      if (error) {
        console.log("Error connecting: ", error.code, error.message);
      }else{
        // successful connection established..
        self.episodeData.identity = Params.query(self.session.connection.data).email;
        if( self.episodeData.subclassName == "Backstage" ){
          // if this is the episode moderator, let everyone know to fetch updates from the server..
          self.updateUserGuestState( self.episodeData.identity, "CONNECTED" );
          self.sendGlobalSignal("MODERATOR_CONNECTED", self.episodeData.identity); 
          self.connectLocalStream();
        }
      }
    });
  },

  disconnectLocalSession: function(){
    this.removeStreamReference(this.session.stream);
    this.updateUserGuestState( this.episodeData.identity, "DISCONNECTED" );
    this.session.disconnect();
  },

  // Local User Methods
  connectLocalStream: function(){
    var self = this;
    // console.log("connectLocalStream");

    if (self.session.capabilities.publish == 1) {
      // preview stream..
      var publisherOptions = {
        insertDefaultUI: false,
        publishAudio:true,
        publishVideo:true
      };

      self.publisher = OT.initPublisher(publisherOptions, function(error){
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
                // self.setState({});
              }else if( self.subclassName == "Backstage"){
              }
            }
          });
        }
      });

      // when the users video element is ready, tie it to user hash
      // self.publisher.on("videoElementCreated", self.videoElementCreated);
      self.publisher.on("videoElementCreated", function( e ){ self.addVideoElementToUser( self.episodeData.identity, e.element ); });

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
    // this.setState({});
  },

  connectRemoteStreamHandler: function( data ){
    this.connectToRemoteStream( data.identity, data.elementId );
  },

  connectToRemoteStream: function( identity ){
    // console.log("connectToRemoteStream", identity)
    var self = this;
    var user = this.getUserByIdentity( identity );
    if(user.player_status != "MOUNTED"){
      user.player_status = "MOUNTED";
      var stream = user.stream;
      // console.log("connect to stream", identity)
      if(stream){
        var streamOptions = {
          insertDefaultUI: false,
          subscribeToVideo: true,
          subscribeToAudio: true,
          width: "100%",
          height: "100%"
        }
        // if this user already has a "local stream", don't pull the audio to prevent echo
        // console.log("IDENTITY", this.episodeData.identity, identity);
        if(identity == this.episodeData.identity){
          streamOptions.subscribeToAudio = false;
        }

        var subscriber = this.session.subscribe(stream, streamOptions); 
        // when the users video element is ready, tie it to user hash
        subscriber.on("videoElementCreated", function( e ){ self.addVideoElementToUser( identity, e.element ); });


        if(identity == this.episodeData.identity){
          //TODO: Don't do this when it's the preview window?
          subscriber.setAudioVolume(0);
        }
        // console.log("CONNECT TO REMOTE STREAM:", subscriber);
      }
    }
  },

  removeAllStreams: function(){
    var updated_attendees = [];
    // loop through, find and change
    for(var i=0; i < this.episodeData.users.length; i++){
      var user = this.episodeData.users[i];
      if( user.stream ){
        // set it locally
        user.guest_state = "DISCONNECTED";
        // pass it to the props for db
        if(user.connection){
          updated_attendees.push({
            user_id: Params.query(user.connection.data).user_id,
            identity: user.identity,
            live_state: user.guest_state,
            av_state: user.av_state
          }); 
        }
        //
        this.session.unsubscribe( user.stream );
      }
    }

    // if we're the moderator, send a signal directly to the person who needs updated..
    var self = this;
    var api = '/api/episodes/'+self.episodeData.episode_id+'/update_rsvps';
    var method = "post";
    var data = { rsvps: JSON.stringify(updated_attendees) };

    self.serverRequest = $.ajax({
      url: api,
      method: method,
      data: data
    }).complete(function ( response ) {
      // console.log("UPDATE GUEST_STATE: ", response );
    });
  },

  resizePlayer: function(){
    // console.log(this.episodeData.users)
  },


  requestStateChange: function(reason){
    // console.log(">> SET EPISODE STATE: reason: ["+reason+"]");
    this.setState( this.episodeData );
  }



};

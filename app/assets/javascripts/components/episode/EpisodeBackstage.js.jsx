var EpisodeBackstage = React.createClass({

  mixins: [EpisodeMixin],

  // TODO: save the current state of the USERS table to the persons cookies.
  // that way, if the admin drops off for a sec, they will be able to refresh.
  // another good way is to maybe periodically send that info to the api just in case
  

  componentWillMount: function() {
    this.preInitialize({subclass_name: "Backstage", episode_state: this.props.episode_state});
  },
  
  componentDidMount: function() {

    if( this.episodeData.episode_state == "ENDED" ){
      console.log("This Episode has ended.");
    }else{
      // from the EpisodeFanListItem
      CSEventManager.addListener("SHOW_GUEST_PREVIEW", this, "showGuestPreview");
      CSEventManager.addListener("HIDE_GUEST_PREVIEW", this, "hideGuestPreview");
      CSEventManager.addListener("IGNORE_IN_LINE_GUEST", this, "ignoreInlineGuest");
      CSEventManager.addListener("PUBLISH_GUEST", this, "publishGuest");
      CSEventManager.addListener("UNPUBLISH_GUEST", this, "unpublishGuest");

      CSEventManager.addListener("UPDATE_GUESTS", this, "updateGuests");
      CSEventManager.addListener("INITIATE_CHAT", this, "initiateChat");

      // CONTROLS
      CSEventManager.addListener("SET_EPISODE_STATE", this, "onSetEpisodeState");
      CSEventManager.addListener("SET_MODERATOR_STATE", this, "onSetModeratorState");
      CSEventManager.addListener("SET_CONTROLS_VIEW_STATE", this, "onSetControlsViewState");

      // super class init
      this.initialize();
      this.session.on("signal", this.receiveSignal);
    }
  },

  // when EpisodeBroadcastStateBtn is toggled
  onSetEpisodeState: function( episode_state ){ this.setEpisodeState( episode_state );  },
  // when EpisodeModeratorStateBtn is toggled
  onSetModeratorState: function( moderator_state ){ 
    // console.log("onSetModeratorState:", moderator_state)
    if( moderator_state == "BROADCASTING" ){
      this.addGuestToBroadcast( this.episodeData.identity );
    }else{
      this.removeGuestFromBroadcast( this.episodeData.identity );
    }
  },
  // when EpisodeModeratorStateBtn is toggled
  onSetControlsViewState: function( controls_view_state ){
    this.episodeData.controls_view_state = controls_view_state;
    this.requestStateChange("changed the control view state")
  },

  // event listener relays
  ignoreInlineGuest: function(data){ this.removeGuestFromLine( data.identity ); },
  showGuestPreview: function(data){ this.connectPreviewStream( data.identity, data.elementId ); },
  hideGuestPreview: function(data){ this.disconnectPreviewStream( data.identity ); },
  publishGuest: function(data){ this.addGuestToBroadcast( data.identity ); },
  unpublishGuest: function(data){ this.removeGuestFromBroadcast( data.identity ); },
  updateGuests: function(data){ /* this.removeGuestFromBroadcast( data.stream.id ); */ },


  // adding / removing preview windows...

  previewSubscribers: [],
  connectPreviewStream: function( identity, elementId ){
    var user = this.getUserByIdentity( identity );

    // console.log(elementId)
    // return;
   
    var tempID = 'preview-'+Guid.get();
    $("#"+elementId).append("<div id='"+tempID+"'></div>");

    var stream = user.stream;
    // console.log("connect to stream", identity)
    if(stream){
      var streamOptions = {
        subscribeToVideo: true,
        subscribeToAudio: false,
        width: "100%",
        height: "100%"
      }

      this.previewSubscribers.push({
        identity: identity,
        subscriber: this.session.subscribe(stream, tempID, streamOptions)
      });


    }
    // this.setState({});
  },

  disconnectPreviewStream: function(identity){
    for(var i=0; i < this.previewSubscribers.length; i++){
      var s = this.previewSubscribers[i];
      if( s.identity == identity ){
        this.session.unsubscribe( s.subscriber );
      }
    }
    // this.setState({});
  },


  componentDidUpdate: function(){ },


  setEpisodeState: function( episode_state ){
    // console.log("SET EPISODE STATE: ", episode_state)
    var self = this;
    // save local
    self.episodeData.episode_state = episode_state;
    // update streamers
    self.sendGlobalSignal("ESPISODE_STATUS_UPDATE", episode_state);
    // update broadcast
    self.updateBroadcast();
    // update player
    // self.setState({});
    // save to DB
    var self = this;
    var api = '/api/episodes/'+self.episodeData.episode_id+'/set_episode_state';
    var method = "post";
    var data = { episode_state: episode_state };

    self.serverRequest = $.ajax({
      url: api,
      method: method,
      data: data
    }).complete(function ( response ) {
      // console.log("updated episode_state, api response: ", response );
    });
    
    if(episode_state == "ENDED"){
      self.removeAllStreams();
      self.disconnectLocalStream();
      self.requestStateChange("Episode has ended.");
    }
  },

  // tokbox message signal..
  receiveSignal: function(e){
    // console.log("signal received: ", e);
    var self = this;
    var data = e.data;
    // logic
    switch( e.type ){
      case "signal:GUEST_JOINED_ROOM":
      // console.log("join room",data)
        this.guestJoinedRoom( data );
        break;

      case "signal:GUEST_LEFT_ROOM":
        this.guestLeftRoom( data );
        break;

      case "signal:GUEST_JOINED_LINE":
        this.addGuestToLine( data );
        break;

      case "signal:GUEST_LEFT_LINE":
        this.removeGuestFromLine( data );
        break;

      case "signal:GUEST_LEFT_BROADCAST":
        this.removeGuestFromBroadcast( data );
        break;

      case "signal:REQUEST_BROADCAST_UPDATE":
        // console.log("User Requested broadcast update", data);
        this.updateBroadcast();
        break;

      case "signal:CHAT_MESSAGE_SAVED":
        CSEventManager.broadcast("CHAT_THREAD_UPDATE");
        break;
    }
  },

  // guest handlers..
  guestJoinedRoom: function( identity ){
    var self = this;
    if( identity != self.episodeData.identity ){
      // console.log("guestJoinedRoom", identity);
      // TODO:  SEND A SPECIFIC MESSAGE TO THE PERSON WHO JOINED.
      if( self.episodeData.episode_state == "LIVE" ){
        self.updateBroadcast(); 
      }else if(self.episodeData.episode_state == "ENDED"){
        // self.endEpisode();
      }
    }
  },

  // 
  guestLeftRoom: function( identity ){
    var self = this;
    // console.log("guestLeftRoom", identity);
    var user = self.getUserByIdentity( identity );
    if( user ){
      self.removeGuestFromLine( identity );
      self.removeGuestFromBroadcast( identity );
      this.updateBroadcast(); 
    }
  },

  // conference management functions..
  addGuestToLine: function( identity ){
    // console.log("Admin::addGuestToLine", identity); 
    this.updateUserGuestState( identity, "IN_LINE" );
    this.sendDirectSignal( identity, "ADDED_TO_LINE", {identity: identity});
    // update this page
    this.requestStateChange("user added to line");
  },

  removeGuestFromLine: function( identity ){
    // console.log("Admin::removeGuestFromLine", identity);
    this.updateUserGuestState( identity, "REMOVED_FROM_LINE" );
    // shoot them a direct message..
    this.sendDirectSignal( identity, "REMOVED_FROM_LINE", {identity: identity});
    // update this page
    this.requestStateChange("user removed from line");
  },

  addGuestToBroadcast: function( identity ){
    // console.log("addGuestToBroadcast", identity);
    this.updateUserGuestState( identity, "ADDED_TO_BROADCAST" );
    // update the broadcast with new guest..
    this.updateBroadcast();
  },

  removeGuestFromBroadcast: function( identity ){
    // console.log("Admin::removeGuestFromBroadcast", identity);
    this.updateUserGuestState( identity, "REMOVED_FROM_BROADCAST" );
    // shoot them a direct message..
    this.sendDirectSignal( identity, "REMOVED_FROM_BROADCAST", {identity: identity});
    // update the broadcast..
    this.updateBroadcast();
  },

  updateBroadcast: function(){
    // console.log(" >> UPDATE BROADCAST");
    if( this.episodeData.episode_state == "LIVE"){
      var broadcasting_users = [];
      // push identities of the current broadcasters..
      for(var i=0; i < this.episodeData.users.length; i++){
        var user = this.episodeData.users[i];
        var identity = user.identity;
        if(user.guest_state == "BROADCASTING"){
          broadcasting_users.push( identity ); 
        }
      }
      // convert to string for passing through signal
      var identities = broadcasting_users.toString();
      // send it
      this.sendGlobalSignal("UPDATE_BROADCAST", identities);
      // update this page.
      this.requestStateChange("update broadcast");
      // this.forceUpdate(); 

    }else if(this.episodeData.episode_state == "ENDED"){
      //
      this.sendGlobalSignal("BROADCAST_ENDED");
      this.removeAllStreams();
      //
      // this.setState({});
    }
  },


  // view
  render:function(){
    // console.log("Admin::render", this.episodeData.users);

    var userPreviewComponent = "";
    if( this.episodeData.episode_state != "ENDED"){
      var user = this.getUserByIdentity( this.episodeData.identity );
      if(user && this.episodeData.guest_state != "BROADCASTING" ){
        userPreviewComponent = 
          <div id="your-stream">
            <TokboxVideo videoElement={user.videoElement} />
          </div>;

        // userPreviewComponent = ""
      } 
    }

    // console.log(this.props.chat_thread_id)

    return(
      <div className="container max-video-width episode-container noselect">
        <EpisodePlayer users={ this.episodeData.users } context={this} />
        <div className="controls-bg"></div>
        <EpisodeBackstageControls episodeData={ this.episodeData } />
        {userPreviewComponent}
      </div>
    )
  }
});



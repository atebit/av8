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
    if( this.episodeData.guest_state == "WATCHING" ){
      this.addGuestToBroadcast( this.episodeData.identity );
      this.episodeData.guest_state = moderator_state;
      this.setState({});
    }else{
      this.removeGuestFromBroadcast( this.episodeData.identity );
      this.episodeData.guest_state = moderator_state;
      this.setState({});
    }
  },
  // when EpisodeModeratorStateBtn is toggled
  onSetControlsViewState: function( controls_view_state ){
    this.episodeData.controls_view_state = controls_view_state;
    this.setState({});
  },

  // event listener relays
  ignoreInlineGuest: function(data){ this.removeGuestFromLine( data.identity ); },
  showGuestPreview: function(data){ this.connectToRemoteStream( data.identity, data.elementId ); },
  hideGuestPreview: function(data){ /* this.forceUpdate(); */ },
  publishGuest: function(data){ this.addGuestToBroadcast( data.identity ); },
  unpublishGuest: function(data){ this.removeGuestFromBroadcast( data.identity ); },
  updateGuests: function(data){ /* this.removeGuestFromBroadcast( data.stream.id ); */ },


  componentDidUpdate: function(){ },


  setEpisodeState: function( episode_state ){
    var self = this;
    // save local
    self.episodeData.episode_state = episode_state;
    // update streamers
    self.sendGlobalSignal("ESPISODE_STATUS_UPDATE", episode_state);
    // update broadcast
    self.updateBroadcast();
    // update player
    self.setState({});
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
      self.setState({}); 
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
    }
  },

  // guest handlers..
  guestJoinedRoom: function( identity ){
    var self = this;
    if( identity != self.episodeData.identity ){
      console.log("guestJoinedRoom", identity);
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
    console.log("guestLeftRoom", identity);
    var user = self.getUserByIdentity( identity );
    if( user ){
      self.removeGuestFromLine( identity );
      self.removeGuestFromBroadcast( identity );
      this.updateBroadcast(); 
    }
  },

  // conference management functions..
  addGuestToLine: function( identity ){
    console.log("Admin::addGuestToLine", identity);
    this.updateUserGuestState( identity, "IN_LINE" );
    // update this page
    // console.log("add guest before state", this.episodeData.users);
    this.setState({});
    // console.log("add guest after state", this.episodeData.users);
  },

  removeGuestFromLine: function( identity ){
    console.log("Admin::removeGuestFromLine", identity);
    var user = this.getUserByIdentity( identity );
    user.player_status = "REMOVED";
    user.guest_state = "WATCHING";
    // shoot them a direct message..
    this.sendDirectSignal( identity, "REMOVED_FROM_LINE", {identity: identity});
    // update this page
    this.setState({});
  },

  addGuestToBroadcast: function( identity ){
    console.log("Admin::addGuestToBroadcast", identity);
    var user = this.getUserByIdentity( identity );
    user.player_status = "CAN_MOUNT";
    user.guest_state = "BROADCASTING";
    // update the broadcast with new guest..
    this.updateBroadcast();
    // reload this page..
    this.setState({});
  },

  removeGuestFromBroadcast: function( identity ){
    console.log("Admin::removeGuestFromBroadcast", identity);
    var user = this.getUserByIdentity( identity );
    user.player_status = "REMOVED";
    user.guest_state = "WATCHING";
    // shoot them a direct message..
    this.sendDirectSignal( identity, "REMOVED_FROM_BROADCAST", {identity: identity});
    // update the broadcast..
    this.updateBroadcast();
    // update this page..
    this.forceUpdate();
  },

  updateBroadcast: function(){
    // console.log("admin: update broadcast");
    // if( this.episodeData.episode_state == "LIVE"){
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
      this.forceUpdate(); 

    // }else if(this.episodeData.episode_state == "ENDED"){
    //   //
    //   this.sendGlobalSignal("BROADCAST_ENDED");
    //   this.removeAllStreams();
    //   //
    //   this.setState({});
    // }
  },


  // view
  render:function(){
    console.log("Admin::render", this.episodeData.users);

    var yourStreamClasses = "";
    if( this.episodeData.episode_state != "ENDED"){
      if(this.episodeData.guest_state == "BROADCASTING" ){
        yourStreamClasses = " hidden ";
      } 
    }

    return(
      <div className="container max-video-width episode-container noselect">
        <EpisodePlayer users={ this.episodeData.users } context={this} />
        <EpisodeBackstageControls episodeData={ this.episodeData } />
        <div id="your-stream" className={yourStreamClasses}></div>
      </div>
    )
  }
});



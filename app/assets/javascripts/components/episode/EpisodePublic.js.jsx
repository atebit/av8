var EpisodePublic = React.createClass({

  mixins: [EpisodeMixin],

  componentWillMount: function() {
    this.preInitialize({subclass_name: "Public", episode_state: this.props.episode_state});
  },
  
  componentDidMount: function() {

    CSEventManager.addListener("SET_GUEST_STATE", this, "onSetGuestState");

    if( this.episodeData.episode_state == "ENDED" ){
      console.log("This Episode has ended.");
    }else{
      var self = this;
      /// click events, etc
      self.initialize();
      this.session.on("signal", this.receiveSignal);
      // initial state..
      this.episodeData.guest_state = "WATCHING";
      this.setState({});
    }
  },

  componentDidUpdate: function(){
    // component updated.
  },

  onSetGuestState: function( guest_state ){
    if( guest_state == "JOIN_LINE" ){
      this.connectLocalStream();
      this.sendGlobalSignal("GUEST_JOINED_LINE", this.episodeData.identity);
      this.episodeData.guest_state = "IN_LINE";
      // this.setState({}); 

    }else if( guest_state == "LEFT_LINE"){
      this.disconnectLocalStream(); 
      this.sendGlobalSignal("GUEST_LEFT_LINE", this.episodeData.identity);
      this.episodeData.guest_state = "WATCHING";
      this.setState({}); 

    }else if( guest_state == "LEFT_BROADCAST"){
      this.disconnectLocalStream(); 
      this.sendGlobalSignal("GUEST_LEFT_BROADCAST", this.episodeData.identity);
      this.episodeData.guest_state = "WATCHING";
      this.setState({}); 
    }
  },

  receiveSignal: function(e){ 
    var self = this;
    var data = e.data;
      console.log("signal recieved", data); 

    switch( e.type ){

      case "signal:UPDATE_SESSION_STATUS":
        // console.log("signal recieved to update SESSION STATUS", data);
        this.updatedUserSessionStatus( self.episodeData.identity, data );
        
        break;

      case "signal:REMOVED_FROM_LINE":
        // console.log("Moderator removed you from line");

        var user = this.getUserByIdentity( this.episodeData.identity );
        user.guest_state = "WATCHING";

        this.disconnectLocalStream(); 
        this.episodeData.guest_state = "WATCHING";
        this.setState({});
        
        break;

      case "signal:REMOVED_FROM_BROADCAST":
        // console.log("Moderator removed you from broadcast");
        
        var user = this.getUserByIdentity( this.episodeData.identity );
        user.guest_state = "WATCHING";

        this.disconnectLocalStream(); 
        this.episodeData.guest_state = "WATCHING";
        this.setState({});

        break;

      case "signal:UPDATE_BROADCAST":
        // console.log("global update broadcast");
        var publishedStreamIdentities = e.data.split(",");
        this.updateBroadcastPlayer( publishedStreamIdentities );
        break;

      case "signal:MODERATOR_CONNECTED":
      case "signal:MODERATOR_DISCONNECTED":
        // console.log("Moderator has joined, fetch state from the server.");
        // var publishedStreamIdentities = e.data.split(",");
        // this.updateBroadcastPlayer( publishedStreamIdentities );
        // TODO: hack to reload based on moderator dropping out..
        // self.getEpisodeState();

        location.reload();
        break;

      case "signal:ESPISODE_STATUS_UPDATE":
        this.episodeData.episode_state = data;
        // console.log("episode status update", data);
        if( data == "ENDED" ){
          this.removeAllStreams();
          this.episodeData.guest_state = "ENDED";
          this.setState({});
        }
        break;
    }
  },

  // update the player

  updateBroadcastPlayer: function( published_identities ){

    // TODO: check to see if the player needs to update or not... 
    // If not, don't update because it causes a blink to the users that don't need it.
    var isSelfStream = false;

    // loop through passed identities
      // loop through users
    var users = this.episodeData.users;
    for(var j=0; j < users.length; j++){
      var user = users[j];

      // auto set the users status to nope
      user.guest_state = "REMOVED";
      user.player_status = "REMOVED";

      for(var i=0; i < published_identities.length; i++){
        var loop_identity = published_identities[i];
        // if user is one of the identities
        if( user.identity == loop_identity ){
          // set the props
          user.guest_state = "BROADCASTING";
          user.player_status = "CAN_MOUNT";
          if( this.episodeData.identity == user.identity ){
            isSelfStream = true;
          }
        }

      }
    }

    // if no users were passed, remove any that are on the broadcast..
    // console.log(published_identities)
    if(published_identities.length == 0 || published_identities[0] == ""){
      // this.removeAllStreams();
    }


    if(isSelfStream){
      this.episodeData.guest_state = "BROADCASTING";
      this.setState({});
    }else{
      this.episodeData.guest_state = "WATCHING";
      this.setState({});
    }
  },

  render:function(){

    var userPreviewComponent = "";
    if( this.episodeData.episode_state != "ENDED"){
      var user = this.getUserByIdentity( this.episodeData.identity );
      if(user && this.episodeData.guest_state == "IN_LINE" ){
        userPreviewComponent = 
          <div id="your-stream">
            <TokboxVideo videoElement={user.videoElement} />
          </div>;
      } 
    }


    return(
      <div className="container max-video-width episode-container noselect">
        <EpisodePlayer users={ this.episodeData.users } context={this} />
        <div className="controls-bg"></div>
        <EpisodePublicControls episodeData={ this.episodeData } />
        {userPreviewComponent}
      </div>
    )
  }
});



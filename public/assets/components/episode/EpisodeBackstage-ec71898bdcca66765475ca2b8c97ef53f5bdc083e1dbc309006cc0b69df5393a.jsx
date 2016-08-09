var EpisodeBackstage = React.createClass({

  mixins: [EpisodeMixin],

  componentWillMount: function() {
    // listeners... init, etc
    this.subclassName = "Backstage";
  },
  
  componentDidMount: function() {
    CSEventManager.addListener("IGNORE_IN_LINE_GUEST", this, "ignoreInlineGuest");
    CSEventManager.addListener("PREVIEW_GUEST", this, "previewGuest");
    CSEventManager.addListener("PUBLISH_GUEST", this, "publishGuest");
    CSEventManager.addListener("UNPUBLISH_GUEST", this, "unpublishGuest");
    
    CSEventManager.addListener("UPDATE_GUESTS", this, "updateGuests");
    CSEventManager.addListener("UPDATE_MANAGER", this, "updateManager");

    // super class init
    this.init();
    this.session.on("signal", this.receiveGlobalSignal);
  },

  componentDidUpdate: function(){
    // component updated.
  },

  receiveGlobalSignal: function(e){ 
    // console.log("receiveGlobalSignal", e)
  },

  // init

  ignoreInlineGuest: function( data ){
    // { stream: self.props.stream }
    // send a message to guest that they've been ignored...
  },

  previewGuest: function(data){
    // { streamId: self.props.stream.id, elementId: self.previewVidId }
    this.connectToRemoteStream( data.streamId, data.elementId );
  },

  publishGuest: function(data){
    // { stream: self.props.stream }
    var self = this;
    self.guests_published.push(data.stream);
    // send a message to all the sessions to update...

    // refresh this view
    self.setState({ scope: this }); 
  },

  unpublishGuest: function(data){
    // { stream: self.props.stream }
    var self = this;
     for(var i=0; i < self.guests_published.length; i++) {
      if( self.guests_published[i].id == e.stream.id ){
        self.guests_published.splice(i,1); 
      }
    }
    self.setState({ scope: this }); 
  },

  updateGuests: function(){
    var self = this;
    // console.log(self.guests_published);
    var streamIds = [];
    for(var i=0; i < self.guests_published.length; i++){
      streamIds.push( self.guests_published[i].id );
    }

    self.sendGlobalSignal("UPDATE_PLAYER", streamIds.toString());
  },

  updateManager: function(){
    var self = this;

    console.log("update manager:",this.guests_in_line)
    self.setState({ scope: this }); 
    // var self = this;
    // // console.log(self.guests_published);
    // var streamIds = [];
    // for(var i=0; i < self.guests_published.length; i++){
    //   streamIds.push( self.guests_published[i].id );
    // }

    // self.sendGlobalSignal("UPDATE_PLAYER", streamIds.toString());
  },

  render:function(){

    var self = this;
    var fanListComponent = [];
    if(this.guests_in_line.length > 0){
      for(var i=0; i < this.guests_in_line.length; i++){
        var stream = this.guests_in_line[i];
        fanListComponent.push(<EpisodeFanListItem stream={stream} context={this} key={i} />);
      }
    }

    return(

      <div className="container">

        <div className="grid no-padding">
          <div className="col-10-12">
            <div className="episode-player-container">
              <p>Stream</p>
              <EpisodePlayer streams={self.guests_published} context={this} />
            </div>
          </div>
          <div className="col-2-12">
            <div>
              <p>Guests in line</p>
              <div id="fan-list">{fanListComponent}</div>
            </div>
          </div>
        </div>

        <div id="your-stream"></div>
      </div>
    )
  }
});



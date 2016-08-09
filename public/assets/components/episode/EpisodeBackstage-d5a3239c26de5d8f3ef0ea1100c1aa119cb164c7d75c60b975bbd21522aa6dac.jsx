var EpisodeBackstage = React.createClass({

  mixins: [EpisodeMixin],

  guests_in_line: [],

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

    // super class init
    this.init();
    this.session.on("signal", this.receiveGlobalSignal);
  },

  componentDidUpdate: function(){
    // component updated.
  },

  // event listener relays
  ignoreInlineGuest: function(data){
    this.removeGuestFromLine( data.stream.id );
  },

  previewGuest: function(data){
    this.connectToRemoteStream( data.streamId, data.elementId );
  },

  publishGuest: function(data){
    this.addGuestToBroadcast( data.stream.id );
  },

  unpublishGuest: function(data){
    this.removeGuestFromBroadcast( data.stream.id );
  },

  updateGuests: function(data){
    // this.removeGuestFromBroadcast( data.stream.id );
  },

  // tokbox network signal..

  receiveGlobalSignal: function(e){ 
    var self = this;
    var streamId = e.data;


    switch( e.type ){

      case "signal:GUEST_JOINED_LINE":
        this.addGuestToLine( streamId );
        break;

      case "signal:GUEST_LEFT_LINE":
        this.removeGuestFromLine( streamId );
        break;

      case "signal:GUEST_LEFT_BROADCAST":
        this.removeGuestFromBroadcast( streamId );
        break;

    }
  },

  // conference management functions..

  addGuestToLine: function( streamId ){
    if( this.guests_in_line == undefined ) this.guests_in_line = [];
    this.guests_in_line.push( streamId );
    this.guests_in_line = $.unique(this.guests_in_line); // remove dups

    this.forceUpdate();
  },

  removeGuestFromLine: function( streamId ){
    // console.log("remove guest")
    for(var i=0; i < this.guests_in_line.length; i++) {
      if( this.guests_in_line[i] == streamId ){
        this.guests_in_line.splice(i,1);
        this.removeStreamReference(this.guests_in_line[i]);
      }
    }

    this.forceUpdate();
  },

  addGuestToBroadcast: function( streamId ){
    // add to publish list...
    if( this.published_streams == undefined ) this.published_streams = [];
    this.published_streams.push( this.getStreamById(streamId) );
    this.published_streams = $.unique(this.published_streams); // remove dups

    // remove from guest line...
    this.removeGuestFromLine( streamId );

    this.updateBroadcast();
    this.forceUpdate();
  },

  removeGuestFromBroadcast: function( streamId ){
    // remove from published..
    for(var i=0; i < this.published_streams.length; i++) {
      if( this.published_streams[i].id == streamId ){
        this.published_streams.splice(i, 1);
        this.removeStreamReference(this.published_streams[i]);
      }
    }
    // and remove from line...
    this.removeGuestFromLine( streamId );


    this.updateBroadcast();
    this.forceUpdate();
  },

  updateBroadcast: function(){
    var streamIds = [];
    for( var s in this.published_streams) streamIds.push(this.published_streams[s].id);
    var publishedStreamIds = streamIds.toString();
    this.sendGlobalSignal("UPDATE_BROADCAST", publishedStreamIds);
    // console.log("update player")
    this.forceUpdate();
  },


  // view

  render:function(){

    var self = this;
    var fanListComponent = [];
    if(this.guests_in_line.length > 0){
      for(var i=0; i < this.guests_in_line.length; i++){
        var stream = this.getStreamById( this.guests_in_line[i] );
        fanListComponent.push(<EpisodeFanListItem stream={stream} key={i} />);
      }
    }

    return(

      <div className="container">
        <header>
          <button>PREVIEW SHOW</button>
          <button>START SHOW</button>
          <button>END SHOW</button>
        </header>

        <div className="grid no-padding">
          <div className="col-10-12">
            <div className="episode-player-container">
              <p>Stream</p>
              <EpisodePlayer streams={this.published_streams} context={this} />
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



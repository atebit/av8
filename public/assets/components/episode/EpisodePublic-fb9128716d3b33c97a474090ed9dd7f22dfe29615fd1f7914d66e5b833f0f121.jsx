var EpisodePublic = React.createClass({

  mixins: [EpisodeMixin],

  componentWillMount: function() {
    // listeners... init, etc
    this.subclassName = "Public";
  },
  
  componentDidMount: function() {
    var self = this;
    /// click events, etc
    self.init();
    this.session.on("signal", this.receiveGlobalSignal);

    $("#get-in-line-btn").on("click", function(e){
      if( $(this).html() == "Get In Line"){
        // $(this).html("Leave Line"); 
        $(this).remove();
        self.connectLocalStream();
      }else{
        $(this).html("Get In Line");
        self.disconnectLocalStream(); 
      }
    });

  },

  componentDidUpdate: function(){
    // component updated.
  },

  receiveGlobalSignal: function(e){ 
    var self = this;

    if(e.type == "signal:UPDATE_PLAYER"){
      var streamIds = e.data.split(",");
      // console.log("streamIds", streamIds);
      for(var i=0; i < streamIds.length; i++){

        var isSelfStream = false;

        if(self.publisher){
          if(self.publisher.streamId == streamIds[i]){
            // self id
            isSelfStream = true;
            self.guests_published.push(self.publisher.stream);  
          }
        }

        if(!isSelfStream){
          // remote ids
          for(var j=0; j < self.guests_in_line.length; j++){
            // console.log("guest in line:",self.guests_in_line[j].id);
            if(self.guests_in_line[j].id == streamIds[i]){
              self.guests_published.push(self.guests_in_line[j]);     
            }
          }
        }
      }
    }

    this.setState({ context:this });
  },

  render:function(){

    // local vars

    return(
      <div className="container">
        <EpisodePlayer streams={this.guests_published} context={this} />
        <div id="your-stream"></div>
        <button id="get-in-line-btn">Get In Line</button>
      </div>
    )
  }
});



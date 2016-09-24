var EpisodeChatMessage = React.createClass({

  componentWillMount: function(){
    this.store = {}
    this.store.id = "chat-msg-"+Guid.get();
    this.store.name = (this.props.message.user.name == null) ? "Some Name" : this.props.message.user.name;
    // var nameColor = ColorFunctions.stringToHex(this.store.name);
    // var pastel = ColorFunctions.randomPastel( nameColor );
    // this.store.color = String("#"+pastel);
  },
  
  componentDidMount: function() { 
    var self=this;
    setTimeout(function(){ 
      self.setOpacity(); 
    }, 100);
  },

  componentDidUpdate: function(){ this.setOpacity(); },

  setOpacity: function(){
    // console.log(this.props)
    var container = $("#"+this.props.container_id);
    var offset = container.offset().top;
    var h = container.height();
    var message = $("#"+this.store.id);
    var msgOffset = message.offset().top - offset;
    // console.log( offset, h  );
    // console.log( "set opacity")

    $(message).css("opacity",  msgOffset / 200 );

  },

  render:function(){

    var style={
      opacity:0,
    }

    return(

      <div id={this.store.id} className="chat-thread-item" style={style}>
        <div className="avatar"></div>
        <div className="message">
          <div className="name">{this.store.name}</div>
          <div className="content">{this.props.message.content}</div>
        </div>
      </div>
    )
  }
});
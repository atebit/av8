var EpisodeChatMessage = React.createClass({

  componentWillMount: function(){
    this.store = {}
    this.store.id = "chat-msg-"+Guid.get();
    this.store.name = (this.props.message.user.name == null) ? "Some Name" : this.props.message.user.name;
    var nameColor = ColorFunctions.stringToHex(this.store.name);
    var pastel = ColorFunctions.randomPastel( nameColor );
    this.store.color = String("#"+pastel);
  },
  
  componentDidMount: function() { this.setOpacity(); },

  componentDidUpdate: function(){ this.setOpacity(); },

  setOpacity: function(){
    var container = $("#"+this.props.container_id);
    var offset = container.offset().top;
    var h = container.height();
    var message = $("#"+this.store.id);
    var msgOffset = message.offset().top - offset;
    // console.log( offset, h  );
    // console.log( "set opacity")

    $(message).css("opacity",  msgOffset / 100 );

  },

  render:function(){

    var style={
      backgroundColor: this.store.color,
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
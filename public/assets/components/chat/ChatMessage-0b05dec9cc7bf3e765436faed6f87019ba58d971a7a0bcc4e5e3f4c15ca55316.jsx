var ChatMessage = React.createClass({

  componentDidMount: function() { },
  componentWillUnmount: function() { },
  componentDidUpdate: function(){ },

  render:function(){
    var message = this.props.messageData;
    var time = message.created_at;
    var user_id = message.user.id;
    var name = message.user.name;
    var content = message.content;

    return(
      <div className="chat-message">
        <span data-user-id={user_id} className="name">{name}</span>
        <span className="content">{content}</span>
      </div>
    )
  }
});

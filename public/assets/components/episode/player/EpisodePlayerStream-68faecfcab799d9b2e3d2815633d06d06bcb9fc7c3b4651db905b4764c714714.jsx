var EpisodePlayerStream = React.createClass({
  
  componentDidMount: function() {
    // console.log("episode player stream mount")
  },

  render: function(){
    var css = this.props.css;
    // console.log("props", css)
    return(
      <div id={this.props.container_id} className="guest-stream" style={css.container}>

        <TokboxVideo 
          id={this.props.video_id} 
          css={css} 
          stream={this.props.stream}
          videoElement={this.props.user.videoElement} />

        <div className="stream-identity">{this.props.user.identity}</div>
      </div> 
    )
  }
});
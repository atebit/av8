var TokboxVideo = React.createClass({

  componentWillMount: function(){ 
    this.videoId = "tokbox-video-"+Guid.get();
  },
  componentDidMount: function() { 
    console.log("RENDER TOKBOX VIDEO:", this.props);

    var video = $("#"+this.videoId)[0];
    console.log(video)

    video.srcObject = this.props.videoElement.srcObject;

  },
  componentDidUpdate: function(){ },

  render:function(){

    var videoElement = this.props.videoElement;

    return(
      <video id={this.videoId} autoPlay="true" />
    )
  }
});




    
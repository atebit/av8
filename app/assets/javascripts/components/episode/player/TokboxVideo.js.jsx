var TokboxVideo = React.createClass({

  componentWillMount: function(){  
    this.videoId = "tokbox-video-"+Guid.get(); 
  },
  componentDidMount: function() {  this.attachVideo(); },
  componentDidUpdate: function(){  this.attachVideo(); },

  attachVideo: function(){
    var videoJQ = $("#"+this.videoId)
    var video = videoJQ[0];
    if(this.props.videoElement){
      video.srcObject = this.props.videoElement.srcObject; 


      // hack to remove volume from own videos...
      if(this.props.user){
        if(this.props.user.is_local){
          // console.log(video)
          video.volume = 0;
        }
      }else{
        video.volume = 0;
      }
    }
  },

  render:function(){
    // console.log("render tb vid")

    // TODO: make this more intelligent...
    // currently it just lays out every video horiz, should be like this:
    // up to 3: side by side
    // 4: boxes
    // 5: 3 up top, two below
    // 6: 3 x 3
    // etc..

    // first set the style going in for proper height/width...
    var style = {};

    if( this.props.css ){
    // if css was passed to this object from the container.
      var css = this.props.css.container;
      var containerW = css.width;
      var containerH = css.height;
      var containerRatio = containerH / containerW;
      var vidDimensions = this.props.stream.videoDimensions;
      var vidRatio = vidDimensions.height / vidDimensions.width;

      // position absolute..
      style.position = "absolute";

      if( containerW > containerH ){
        // horizontal
        style.width = containerW;
        style.height = Math.round(containerW * vidRatio);
        if( style.height > containerH ){
          var offset =  (containerH-style.height) / 2;
          style.marginTop = offset;
        }
      }
      if( containerH > containerW ){
        // vertical
        style.height = containerH;
        style.width = Math.round(containerH * containerRatio);

        if( style.width > containerW ){
          var offset =  (containerW-style.width) / 2;
          style.marginLeft = offset;
        }
      }
    }

    return(
      <video id={this.videoId} style={style}  autoPlay="true" />
    )
  }
});




    
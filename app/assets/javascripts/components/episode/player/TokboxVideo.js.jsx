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

      // if it needs adjusted, reset the margin to do so.
      // console.log("attach vid")
      if( this.props.css ){
        var self = this;
        // setTimeout(function(){
        //   var vidW = videoJQ.width();
        //   var vidH = videoJQ.height();
        //   var containerW = self.props.css.container.width;
        //   var containerH = self.props.css.container.height;

        //   console.log("v[w,h]", vidW, vidH)
        //   console.log("c[w,h]", containerW, containerH)

        //   if( vidW > containerW ){
        //     console.log("width is bigger:", vidW, containerW, vidW-containerW);
        //     var offset = (vidW-containerW);
        //     videoJQ.css("margin-left", String(-offset)+"px" )
        //   }
        //   if( vidH > containerH ){
        //     console.log("height is bigger:", vidH, containerH, vidH-containerH);
        //     var offset = (vidH-containerH);
        //     videoJQ.css("margin-top", String(-offset)+"px" )
        //   }

        // }, 1000);


      }

    }
  },

  render:function(){

    // first set the style going in for proper height/width...
    var style = {  };
    if( this.props.css ){
      var css = this.props.css.container;
      if( css.width > css.height){
        style.position = "absolute";
        style.width = css.width;
        style.height = "auto";
      }else{
        style.position = "absolute";
        style.width = "auto";
        style.height = css.height;
      }
    }

    return(
      <video id={this.videoId} style={style}  autoPlay="true" />
    )
  }
});




    
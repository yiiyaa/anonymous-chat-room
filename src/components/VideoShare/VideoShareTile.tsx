import * as React from 'react';
import { Fragment } from "react";
import { ScreenShareIcon } from '@/livekit-react-offical/assets/icons';
import { checkIsFlv, checkIsHLS } from '@/lib/client-utils';
import MyPlayer  from './MyPlayer'
export type VideoShareTileProps = React.HTMLAttributes<HTMLDivElement> & {
    sharedUrl:string,
    muted:boolean,
};

export const VideoShareTile = ({
  sharedUrl,
   muted,
  ...htmlProps
}: VideoShareTileProps) => {
    // React.useEffect(()=>{
    //     require("flv.js")
    // })
    const [showIcon, setShowIcon] = React.useState(true)
  const [tencentTplayer, setTencentTplayer] =  React.useState(undefined as any)
  
  const isFlv = React.useMemo(()=>{
    return checkIsFlv(sharedUrl)
  }, [sharedUrl])
  
  const isWSMp4 = React.useMemo(()=>{
    const regex = /^(ws|wss):\/\/.*\.mp4$/i;
    console.log("isWSMp42", regex.test(sharedUrl))
    return regex.test(sharedUrl)
  }, [sharedUrl])

//   tencent webrtc
  const isWebrtc = React.useMemo(()=>{
    const regex = /^webrtc:.*/i;
    console.log("isWebrtc", regex.test(sharedUrl))
    return regex.test(sharedUrl)
  }, [sharedUrl])

  const isZlmWebrtc = React.useMemo(()=>{
    return sharedUrl.indexOf('index/api/webrtc') >= 0;
  }, [sharedUrl])

  React.useEffect(()=>{
    if(!isWSMp4){
        return
    }
    console.log("isWSMp4", isWSMp4)
    // document.addEventListener('DOMContentLoaded', function () {
    setTimeout(()=>{ 
        var player = new (window as any).wsPlayer("player-container-id", sharedUrl);
        player.open();
    }, 1000)
    // });
  }, [sharedUrl, isWSMp4])

  React.useEffect(()=>{
    if(!isWebrtc){
        return
    }
    debugger

    let playerInstance: any = null;

    const initPlayer = () => {
        setTimeout(()=>{ 
            playerInstance = (window as any)?.TCPlayer('webrtc-sharevideo-container', {
                sources: [sharedUrl]
              });
              console.log("TCPlayer 初始化成功", playerInstance);
              setTencentTplayer(playerInstance);
        }, 1000)
    };

    if (!tencentTplayer) {
        initPlayer();
      } else {
        console.log("更新播放源", sharedUrl);
        tencentTplayer.src(sharedUrl);
      }
  
      // 组件卸载时清理
      return () => {
        if (playerInstance) {
          // 如果播放器有销毁方法，调用它
          if (playerInstance.dispose) {
            playerInstance.dispose();
          }
        }
      };
  }, [sharedUrl, isWSMp4])

React.useEffect(()=>{
    if(!isZlmWebrtc) return

    const ZLMRTCClient = (window as any).ZLMRTCClient;
    const player = new ZLMRTCClient.Endpoint(
        {
            element: document.getElementById('player-zlmwebrtc-id'),// video 标签
            debug: true,// 是否打印日志
            zlmsdpUrl: sharedUrl,//流地址
        }
    );

    player.on(ZLMRTCClient.Events.WEBRTC_ICE_CANDIDATE_ERROR,function(e: any)
    {
      // ICE 协商出错
      console.log('ICE 协商出错');
    });

    player.on(ZLMRTCClient.Events.WEBRTC_ON_REMOTE_STREAMS,function(s: any)
    {
      //获取到了远端流，可以播放,如果element 为null 或者不传,可以在这里播放(如下注释代码)
      /*
        document.getElementById('video').srcObject=s;
      */
      console.log('播放成功',s);
    });

    player.on(ZLMRTCClient.Events.WEBRTC_OFFER_ANWSER_EXCHANGE_FAILED,function(e: any)
    {
      // offer anwser 交换失败
      console.log('offer anwser 交换失败',e);
      stop();
    });
}, [sharedUrl])


  
  return (
      <div style={{ position: 'relative' }} {...htmlProps}>
        {
            isWSMp4 && (
                <video autoPlay muted controls id="player-container-id"></video>
            )
        }
        {
            isZlmWebrtc && (
                <video autoPlay muted controls id="player-zlmwebrtc-id"></video>
            )
        }
        {
            isWebrtc && (
                <video autoPlay muted controls id="webrtc-sharevideo-container"></video>
            )
        }
        {
            !isWSMp4 && !isWebrtc && !isZlmWebrtc && (
                <MyPlayer sharedUrl={sharedUrl}/> 
            )
        }
    </div>
  );
};

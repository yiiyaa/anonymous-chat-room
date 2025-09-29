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

  const isHLS = React.useMemo(()=>{
    return checkIsHLS(sharedUrl)
  }, [sharedUrl])
  
  return (
      <div style={{ position: 'relative' }} {...htmlProps}>
        {
            isWSMp4 && (
                <video autoPlay muted controls id="player-container-id"></video>
            )
        }
        {
            !isWSMp4 && !isWebrtc && (
                <MyPlayer sharedUrl={sharedUrl}/> 
            )
        }
        {
            isWebrtc && (
                <video autoPlay muted controls id="webrtc-sharevideo-container"></video>
            )
        }
    </div>
  );
};

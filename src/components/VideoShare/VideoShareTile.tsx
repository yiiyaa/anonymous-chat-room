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
  const isFlv = React.useMemo(()=>{
    return checkIsFlv(sharedUrl)
  }, [sharedUrl])
  
  const isWSMp4 = React.useMemo(()=>{
    const regex = /^(ws|wss):\/\/.*\.mp4$/i;
    console.log("isWSMp42", regex.test(sharedUrl))
    return regex.test(sharedUrl)
  }, [sharedUrl])

  React.useEffect(()=>{
    if(!isWSMp4){
        return
    }
    console.log("isWSMp4", isWSMp4)
    // document.addEventListener('DOMContentLoaded', function () {
    setTimeout(()=>{ 
        var player = new (window as any).wsPlayer("video", sharedUrl);
        player.open();
    }, 1000)
    // });
  }, [sharedUrl, isWSMp4])

  const isHLS = React.useMemo(()=>{
    return checkIsHLS(sharedUrl)
  }, [sharedUrl])
  
  return (
      <div style={{ position: 'relative' }} {...htmlProps}>
        {
            isWSMp4 && (
                <video autoPlay muted controls id="video"></video>
            )
        }
        {
            !isWSMp4 && (
                <MyPlayer sharedUrl={sharedUrl}/> 
            )
        }
    </div>
  );
};

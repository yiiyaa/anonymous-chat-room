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
    return process.env.NEXT_PUBLIC_USE_TENCENT_LEB === 'true' && regex.test(sharedUrl)
  }, [sharedUrl])

  const isZlmWebrtc = React.useMemo(()=>{
    return sharedUrl.indexOf('index/api/webrtc') >= 0;
  }, [sharedUrl])

//   ali RTS
  const isArtc = React.useMemo(()=>{
    const regex = /^artc:.*/i;
    console.log("isArtc", regex.test(sharedUrl))
    return process.env.NEXT_PUBLIC_USE_ALI_RTS === 'true' && regex.test(sharedUrl)
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

  // tencent tcplayer
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

// ali artc
React.useEffect(()=>{
    if(!isArtc){
        return
    }

    const mediaElement = document.getElementById('player-artc-id');
    if(!mediaElement) return;
    function subscribeRts() {
        aliRts.subscribe(sharedUrl, {
          // mediaTimeout: 6000  // 自定义超时事件的触发时间
          // retryTimes: 5,      // 自定义重连次数 默认5
              // retryInterval: 2000,// 自定义重连间隔 默认2000ms
        }).then((remoteStream: any) => {
          remoteStream.play(mediaElement);
        }).catch(() => {})
      }
    
      // 初始化 SDK
  const aliRts = (window as any).AliRTS?.createClient();
    // 监听事件，详见 https://help.aliyun.com/document_detail/397570.html
    aliRts.on('onError', (error: any) => {
        console.log(error.errorCode, error.message); // 错误码、错误信息
        // 降级判断
        switch(error.errorCode){
          case 10410:   // 拉流(订阅)重连彻底失败
            // fallback(); // 降级
            console.warn("拉流(订阅)重连彻底失败, 需要降级", error);
            break;
          default:
        }
      });

      
  // 检测浏览器是否支持
  // 对于不在 https://help.aliyun.com/document_detail/397569.html 中的浏览器，可以选择跳过 isSupport 检查，直接执行 subscribeRts 拉流（有风险，需要自测保证）
  aliRts.isSupport({ isReceiveVideo: true }).then((re: any)=> {
        // 支持
        subscribeRts();
    }).catch((err: any)=> {
        // 不支持
        console.warn('浏览器不支持', err);
        // fallback();
    })
})

//   zlm webrtc
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
            isArtc && (
                <video autoPlay muted controls id="player-artc-id"></video>
            )
        }
        {
            isWebrtc && (
                <video autoPlay muted controls id="webrtc-sharevideo-container"></video>
            )
        }
        {
            !isWSMp4 && !isWebrtc && !isZlmWebrtc && !isArtc && (
                <MyPlayer sharedUrl={sharedUrl}/> 
            )
        }
    </div>
  );
};

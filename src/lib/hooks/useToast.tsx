import { useObservableState } from "@/livekit-react-offical/hooks/internal";
import { useEffect, useState } from "react";
import { curState$ } from "../observe/CurStateObs";
export function useShowToast(timeOut: number = 1000) {
    const [isShowToast, setIsShowToast] = useState(false);
    const [TostMsg, setTostMsg] = useState<string>("");
    const [msgQueue, setMsgQueue] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const MAX_QUEUE_SIZE = 5; // 最大队列长度

    const processQueue = (q: string[]) => {
        if (q.length > 0 && !isProcessing) {
            setIsProcessing(true);
            const [nextMsg, ...remainingMsgs] = q;
            setTostMsg(nextMsg);
            setIsShowToast(true);
            
            // 使用函数式更新确保获取最新队列状态
            setMsgQueue(prev => remainingMsgs);
            console.log("remainingMsgs",remainingMsgs);
            
            setTimeout(() => {
                setIsShowToast(false);
                setIsProcessing(false);
                setTimeout(() => {
                    // 再次检查并处理队列
                    setMsgQueue(prev => {
                        if (prev.length > 0) {
                            processQueue(prev);
                        }
                        return prev;
                    });
                }, 400)
            }, timeOut);
        }
    };

    const showToast = (msg: string) => {
        setMsgQueue(prev => {
            // 当队列超过最大长度时，移除最早的消息
            const newQueue = [...prev, msg];
            if (newQueue.length > MAX_QUEUE_SIZE) {
                console.log(newQueue);
                return newQueue.slice(-MAX_QUEUE_SIZE); // 移除队列中的第一个元素
            }
            console.log(newQueue);
            return newQueue;
        });
    };

    useEffect(() => {
        processQueue(msgQueue);
    }, [msgQueue]);

    return {
        TostMsg,
        showToast,
        isShowToast
    };
}


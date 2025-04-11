import 'react-alert-confirm/lib/style.css';
import AlertConfirm from "react-alert-confirm";
import { decoder } from ".";

export const formatter = (rawStr?: string) => {
    const res = decoder(rawStr || "");  
    // debugger  
    if(!res) return;
    const type = res.type;
    switch (type) {
        case 'text':
            return (
                <div style={{ whiteSpace: 'pre-wrap' }}>
                    {res.content}
                </div>
            )
        case 'img':
            return (
                <div>
                    <img onClick={()=>{
                        AlertConfirm({
                        maskClosable: true,
                        custom: (
                            <div className={'max-w-[95vw] max-h-[95vh] display-block'}>
                                <img src={res.content}  alt={'img'} />
                            </div>
                        )
                    })}} src={res.content} alt={'img'} />
                </div>
            )
    }
}
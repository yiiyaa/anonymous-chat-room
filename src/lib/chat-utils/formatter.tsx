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
                </div>
            )
    }
}
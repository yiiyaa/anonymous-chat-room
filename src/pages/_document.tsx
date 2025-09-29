import { Html, Head, Main, NextScript } from 'next/document';
import { theme } from "@/lib/const";
import Script from 'next/script';
export default function Document() {
  return (
    <Html lang="en"  data-theme="garden">
      <Head>
        {
            process.env.NEXT_PUBLIC_USE_TENCENT_LEB === 'true' && (
                <link href="https://web.sdk.qcloud.com/player/tcplayer/release/v5.1.0/tcplayer.min.css" rel="stylesheet"/>
            )
        }
      </Head>
      <body  className=" w-screen h-screen m-0 p-0 bg-neutral-content" >
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* App Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16.png" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* iOS Status Bar */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GORS LOG" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#1f2937" />
        
        {/* Description */}
        <meta name="description" content="Workout tracking app - Be About It" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

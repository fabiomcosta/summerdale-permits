import '@/styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}


// Fetch the data from the API
// const apiUrl = "https://data.cityoforlando.net/resource/5pzm-dn5w.json"


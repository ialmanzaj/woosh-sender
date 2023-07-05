import { ConnectKitButton } from "connectkit";
import Head from "next/head";
import { useAccount } from "wagmi";

export default function Home() {
  const { address } = useAccount();
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <h1>Woosh</h1>
        <div>
          <ConnectKitButton />
          {address && <span className="text-white">{address}</span>}
        </div>
      </main>
    </>
  );
}

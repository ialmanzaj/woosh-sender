import type { Transaction } from "@prisma/client";
import { signOut, useSession } from "next-auth/react";
import { useContext, useState } from "react";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import Layout from "~/components/layout";
import { api } from "~/utils/api";
import SignIn from "~/components/SignIn";
import Button from "~/components/Button";
import Image from "next/image";
import type { GetServerSideProps } from "next";
import {
  type CryptoPrices,
  CryptoPricesContext,
} from "~/context/TokenPricesContext";
import SendToPhone from "~/components/Send/Phone/SendToPhone";
import Divider from "~/components/Divider";
import Contacts from "~/components/Contacts";
import CancelDepositButton from "~/components/DepositVault/CancelDepositButton";
import SendToWallet from "~/components/Send/Wallet/SendToWallet";

const Balances = () => {
  const { cryptoPrices } = useContext(CryptoPricesContext);
  const { address } = useAccount();
  const {
    data: ethBalance,
    isError: ethBalanceError,
    isLoading: ethBalanceLoading,
  } = useBalance({
    address: address,
  });

  interface UserBalance {
    token: string;
    tokenName: "ethereum" | "dai" | "usd-coin";
    balance: number;
  }

  const userBalances: UserBalance[] = [
    {
      token: "ETH",
      tokenName: "ethereum",
      balance: Number(ethBalance?.formatted) || 0,
    },
    {
      token: "DAI",
      tokenName: "dai",
      balance: 200,
    },
    {
      token: "USDC",
      tokenName: "usd-coin",
      balance: 800,
    },
  ];

  console.log(userBalances);

  if (ethBalanceLoading) return <p>Loading...</p>;
  if (ethBalanceError) {
    console.log("balanceError: ", ethBalanceError);
  }

  let totalBalance = 0;

  if (ethBalance && cryptoPrices) {
    for (const userBalance of userBalances) {
      if (cryptoPrices[userBalance.tokenName]?.usd) {
        totalBalance +=
          userBalance.balance * cryptoPrices[userBalance.tokenName]?.usd;
      }
    }
  }

  const Balance = ({
    token,
    balance,
    tokenName,
  }: {
    token: string;
    balance: number;
    tokenName: "ethereum" | "usd-coin" | "dai";
  }) => {
    const { cryptoPrices } = useContext(CryptoPricesContext);
    let balanceInUSD = 0;
    if (cryptoPrices?.[tokenName]?.usd) {
      balanceInUSD = balance * cryptoPrices?.[tokenName]?.usd;
    }
    return (
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-1">
          <Image
            src={`/images/tokens/${token}.svg`}
            width={16}
            height={16}
            alt={token}
            className="h-4 w-4 object-contain"
          />
          <span>{balance} </span>

          <span>{token}</span>
        </div>
        <span>
          {balanceInUSD.toLocaleString("en-us", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
    );
  };

  return (
    <div>
      <p className="mb-8 mt-4 text-4xl">
        {totalBalance.toLocaleString("en-us", {
          style: "currency",
          currency: "USD",
        })}
      </p>
      <Balance
        token="ETH"
        tokenName="ethereum"
        balance={Number(ethBalance?.formatted) || 0}
      />
      <Divider />
      <Balance token="USDC" tokenName="usd-coin" balance={800} />
      <Divider />
      <Balance token="DAI" tokenName="dai" balance={200} />
    </div>
  );
};

const Main = () => {
  return (
    <div className="mt-[8rem] px-4 lg:mt-0 lg:px-0">
      <span className="block font-polysans text-lg">welcome</span>
      <span className="block font-polysans text-2xl">roysandoval.eth</span>
      <Balances />
      <div className="my-12 flex flex-col gap-8 lg:mb-0 lg:mt-14">
        <SendToPhone />
        <SendToWallet />
      </div>
    </div>
  );
};

const TransactionCard = ({ transaction }: { transaction: Transaction }) => {
  const [clicked, setClicked] = useState(false);
  console.log(transaction);
  return (
    <div className="flex justify-between rounded-md bg-[#F1F3F2] px-4 py-5 text-brand-black">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {transaction.recipient ? (
            <>
              <span className="font-polysans">{transaction.recipient}</span>
              <span className="opacity-60">
                {transaction.phone ? transaction.phone : transaction.address}
              </span>
            </>
          ) : (
            <span className="font-polysans">
              {transaction.phone ? transaction.phone : transaction.address}
            </span>
          )}
        </div>
        <span className="opacity-60">
          {transaction.claimed ? "Claimed" : "Unclaimed"}
        </span>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="font-polysans">
          {transaction.amount} {transaction.token}
        </div>
        <span className="opacity-60">
          {transaction.amountInUSD.toLocaleString("en-us", {
            style: "currency",
            currency: "USD",
          })}
        </span>
        {transaction.claimed || transaction.type === "wallet" ? null : (
          <div
            onClick={() => {
              setClicked(!clicked);
            }}
          >
            <CancelDepositButton transaction={transaction} clicked={clicked} />
          </div>
        )}
      </div>
    </div>
  );
};

const PreviousSends = () => {
  const { data: session } = useSession();
  const { data, isLoading } = api.transaction.getTransactions.useQuery(
    undefined,
    {
      enabled: session?.user !== undefined,
    }
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!data) return <div>No data</div>;

  return (
    <div>
      <p className="mb-5 font-polysans text-lg">previous sends</p>
      <div className="flex flex-col gap-5">
        {data.map((transaction) => (
          <div key={transaction.id}>
            <TransactionCard transaction={transaction} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Home({ coinsData }: { coinsData: CryptoPrices }) {
  const { setCryptoPrices } = useContext(CryptoPricesContext);
  const { isConnected } = useAccount();
  const { data: session } = useSession();
  const { disconnect } = useDisconnect();
  const onClickSignOut = async () => {
    await signOut();
    disconnect();
  };

  if (coinsData) {
    setCryptoPrices(coinsData);
  }

  return (
    <Layout>
      {isConnected && session ? (
        <div className="relative h-full min-h-screen w-full items-center lg:grid lg:h-screen lg:grid-cols-[1fr_44%]">
          <div className="mx-auto">
            <Main />
            <button
              onClick={() => void onClickSignOut()}
              className="absolute rounded-full bg-gray-100 px-12 py-4 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60 lg:mt-20"
            >
              Sign Out
            </button>
          </div>
          <div className="flex h-full w-full flex-col gap-20 bg-brand-black px-4 pb-20 pt-20 text-brand-white lg:px-8 lg:pb-0 lg:pt-40">
            <Contacts />
            <PreviousSends />
          </div>
        </div>
      ) : (
        <SignIn />
      )}
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<{
  coinsData: CryptoPrices;
}> = async () => {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum%2Cdai%2Cusd-coin&vs_currencies=mxn%2Cusd"
  );
  const coinsData = (await res.json()) as CryptoPrices;

  return {
    props: {
      coinsData,
    },
  };
};

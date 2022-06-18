import "../styles/globals.css";
import Head from "next/head";
import { MoralisProvider } from "react-moralis";
import Header from "../components/Header";
import { NotificationProvider } from "web3uikit";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
	cache: new InMemoryCache(),
	uri: "https://api.studio.thegraph.com/query/29304/broad-ocean/v0.0.2",
});

function MyApp({ Component, pageProps }) {
	return (
		<div className="bg-gradient-to-t from-indigo-400 to-pink-100 min-h-screen">
			<Head>
				<title>Broad Ocean</title>
				<meta name="description" content="NFT Exchange" />
				<link rel="icon" href="/skull.png" />
			</Head>

			<MoralisProvider initializeOnMount={false}>
				<ApolloProvider client={client}>
					<NotificationProvider>
						<Header />
						<Component {...pageProps} />
					</NotificationProvider>
				</ApolloProvider>
			</MoralisProvider>
		</div>
	);
}

export default MyApp;

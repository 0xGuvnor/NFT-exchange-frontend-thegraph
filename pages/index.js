import Image from "next/image";
import { list } from "postcss";
import { useMoralisQuery, useMoralis } from "react-moralis";
import NFTBox from "../components/NFTBox";
import styles from "../styles/Home.module.css";
import networkMapping from "../constants/networkMapping.json";
import { useQuery } from "@apollo/client";
import GET_ACTIVE_ITEMS from "../constants/subgraphQueries";

export default function Home() {
	const { isWeb3Enabled, chainId: chainIdHex } = useMoralis();
	const chainId = chainIdHex ? parseInt(chainIdHex).toString() : "31337";
	const exchangeAddress = networkMapping[chainId].NftExchange[0];

	const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS);

	return (
		<div className="container mx-auto">
			<h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
			<div className="flex flex-wrap">
				{isWeb3Enabled ? (
					loading || !listedNfts ? (
						<div>Loading...</div>
					) : (
						listedNfts.activeItems.map((nft) => {
							console.log(nft);
							const { price, nftAddr, tokenId, seller } = nft;

							return (
								<div>
									<NFTBox
										price={price}
										nftAddr={nftAddr}
										tokenId={tokenId}
										exchangeAddr={exchangeAddress}
										seller={seller}
										key={`${nftAddr}${tokenId}`}
									/>
								</div>
							);
						})
					)
				) : (
					<div>Connect Your Wallet</div>
				)}
			</div>
		</div>
	);
}

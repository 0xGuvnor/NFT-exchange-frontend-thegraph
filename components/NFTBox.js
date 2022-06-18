import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import nftExchangeAbi from "../constants/NftExchange.json";
import nftAbi from "../constants/BasicNft.json";
import Image from "next/image";
import { Card, useNotification } from "web3uikit";
import { ethers } from "ethers";
import UpdateListingModal from "./UpdateListingModal";

function truncateAddr(addr) {
	const front = addr.slice(0, 6);
	const connector = "...";
	const back = addr.slice(-4);
	return front + connector + back;
}

export default function NFTBox({ price, nftAddr, tokenId, exchangeAddr, seller }) {
	const { isWeb3Enabled, account } = useMoralis();
	const dispatch = useNotification();

	const isOwnedByUser = seller === account || seller === undefined;
	const formattedSellerAddr = isOwnedByUser ? "you" : truncateAddr(seller);

	const [imageURI, setImageURI] = useState("");
	const [tokenName, setTokenName] = useState("");
	const [tokenDescription, setTokenDescription] = useState("");
	const [showModal, setShowModal] = useState(false);
	const hideModal = () => setShowModal(false);

	const { runContractFunction: getTokenURI } = useWeb3Contract({
		abi: nftAbi,
		contractAddress: nftAddr,
		functionName: "tokenURI",
		params: { tokenId },
	});

	const { runContractFunction: buyNft } = useWeb3Contract({
		abi: nftExchangeAbi,
		contractAddress: exchangeAddr,
		functionName: "buyNft",
		msgValue: price,
		params: { _nftAddr: nftAddr, _tokenId: tokenId },
	});

	async function updateUI() {
		const tokenURI = await getTokenURI();
		console.log(`The TokenURI is: ${tokenURI}`);
		if (tokenURI) {
			// IPFS Gateway: Returns IPFS files from a "normal" URL
			const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
			const tokenURIResponse = await (await fetch(requestURL)).json();
			const imageURI = tokenURIResponse.image;
			const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/");
			setImageURI(imageURIURL);
			setTokenName(tokenURIResponse.name);
			setTokenDescription(tokenURIResponse.description);
		}
	}

	useEffect(() => {
		if (isWeb3Enabled) {
			updateUI();
		}
	}, [isWeb3Enabled]);

	const handlebuyNftSuccess = async (tx) => {
		await tx.wait(1);
		dispatch({
			type: "success",
			title: "Item Bought",
			message: "Enjoy your purchase!",
			position: "topR",
		});
	};

	const handleCardClick = () => {
		isOwnedByUser
			? setShowModal(true)
			: buyNft({
					onError: (error) => console.log(error),
					onSuccess: handlebuyNftSuccess,
			  });
	};

	return (
		<div>
			<div className="py-2 px-2">
				{imageURI ? (
					<div>
						<UpdateListingModal
							isVisible={showModal}
							tokenId={tokenId}
							exchangeAddr={exchangeAddr}
							nftAddr={nftAddr}
							onClose={hideModal}
						/>
						<Card
							title={tokenName}
							description={tokenDescription}
							onClick={handleCardClick}
						>
							<div className="p2">
								<div className="flex flex-col items-end gap-2">
									<div>#{tokenId}</div>
									<div className="italis text-sm">
										Owned by {formattedSellerAddr}
									</div>
									<Image
										loader={() => imageURI}
										src={imageURI}
										height="200"
										width="200"
									/>
									<div className="font-bold">
										{ethers.utils.formatEther(price)} ETH
									</div>
								</div>
							</div>
						</Card>
					</div>
				) : (
					<div>Loading</div>
				)}
			</div>
		</div>
	);
}

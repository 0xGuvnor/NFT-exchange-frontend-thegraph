import { useState } from "react";
import { useWeb3Contract } from "react-moralis";
import { Icon, Input, Modal, Typography, useNotification } from "web3uikit";
import nftExchangeAbi from "../constants/NftExchange.json";
import { ethers } from "ethers";

export default function UpdateListingModal({ nftAddr, tokenId, isVisible, exchangeAddr, onClose }) {
	const dispatch = useNotification();

	const [UpdatedPrice, setUpdatedPrice] = useState(0);

	const handleUpdateListingSuccess = async (tx) => {
		await tx.wait(1);
		dispatch({
			type: "success",
			title: "Listing Updated",
			message: "Please refresh to view your updated listing!",
			position: "topR",
		});
		onClose && onClose();
		setUpdatedPrice(0);
	};

	const { runContractFunction: updateListing } = useWeb3Contract({
		abi: nftExchangeAbi,
		contractAddress: exchangeAddr,
		functionName: "updateListing",
		params: {
			_nftAddr: nftAddr,
			_tokenId: tokenId,
			_newPrice: ethers.utils.parseEther(UpdatedPrice.toString() || "0"),
		},
	});

	return (
		<Modal
			isVisible={isVisible}
			onCancel={onClose}
			onCloseButtonPressed={onClose}
			okText="Confirm"
			onOk={() => {
				updateListing({
					onError: (error) => console.log(error),
					onSuccess: handleUpdateListingSuccess,
				});
			}}
			title={
				<div className="flex flex-row">
					<Icon fill="#000000" size={32} svg="edit" />
					<div className="px-2">
						<Typography color="#68738D" variant="h3">
							Update Listing Price
						</Typography>
					</div>
				</div>
			}
		>
			<div className="py-4">
				<Input
					label="Price in ETH"
					name="New listing price"
					type="number"
					onChange={(event) => setUpdatedPrice(event.target.value)}
				/>
			</div>
		</Modal>
	);
}

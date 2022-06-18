import { Button, Form, useNotification } from "web3uikit";
import { ethers } from "ethers";
import nftExchangeAbi from "../constants/NftExchange.json";
import networkMapping from "../constants/networkMapping.json";
import nftAbi from "../constants/BasicNft.json";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useEffect, useState } from "react";

export default function Home() {
	const { chainId: chainIdHex, account, isWeb3Enabled } = useMoralis();
	const chainId = chainIdHex ? parseInt(chainIdHex).toString() : "31337";
	const exchangeAddr = networkMapping[chainId].NftExchange[0];
	const [proceeds, setProceeds] = useState("0");

	const { runContractFunction } = useWeb3Contract();
	const dispatch = useNotification();

	async function approveAndList(data) {
		console.log("Approving...");
		const nftAddr = data.data[0].inputResult;
		const tokenId = data.data[1].inputResult;
		const price = ethers.utils.parseEther(data.data[2].inputResult).toString();

		const approveOptions = {
			abi: nftAbi,
			contractAddress: nftAddr,
			functionName: "approve",
			params: {
				to: exchangeAddr,
				tokenId: tokenId,
			},
		};

		await runContractFunction({
			params: approveOptions,
			onSuccess: () => handleApproveSuccess(nftAddr, tokenId, price),
			onError: (error) => console.log(error),
		});
	}

	async function handleApproveSuccess(nftAddr, tokenId, price) {
		const listOptions = {
			abi: nftExchangeAbi,
			contractAddress: exchangeAddr,
			functionName: "listNft",
			params: {
				_nftAddr: nftAddr,
				_tokenId: tokenId,
				_price: price,
			},
		};

		await runContractFunction({
			params: listOptions,
			onSuccess: handleListSuccess,
			onError: (error) => console.log(error),
		});
	}

	async function handleListSuccess(tx) {
		await tx.wait(1);
		dispatch({
			type: "success",
			title: "NFT Listed",
			message: "You've successfully listed your NFT!",
			position: "topR",
		});
	}

	async function handleWithdrawSuccess(tx) {
		await tx.wait(1);
		dispatch({
			type: "success",
			title: "Withdrawing Proceeds",
			message: "Withdraw successfull!",
			position: "topR",
		});
	}

	async function updateUI() {
		const withdrawableProceeds = await runContractFunction({
			params: {
				abi: nftExchangeAbi,
				contractAddress: exchangeAddr,
				functionName: "getProceeds",
				params: { _seller: account },
			},
			onError: (error) => console.log(error),
		});
		if (withdrawableProceeds) {
			setProceeds(withdrawableProceeds.toString());
		}
	}

	useEffect(() => {
		updateUI();
	}, [proceeds, account, isWeb3Enabled, chainId]);

	return (
		<div className="py-4 px-6 max-w-lg flex flex-col container mx-auto">
			<Form
				onSubmit={approveAndList}
				data={[
					{
						name: "NFT Address",
						type: "text",
						inputWidth: "100%",
						value: "",
						key: "nftAddr",
					},
					{
						name: "Token ID",
						type: "number",
						value: "",
						key: "tokenId",
					},
					{
						name: "Price (ETH)",
						type: "number",
						value: "",
						key: "price",
					},
				]}
				title="Sell your NFT!"
				id="Main Form"
			/>
			<div className="py-4 px-4">
				<div className="text-2xl pb-2">
					Withdraw {ethers.utils.formatEther(proceeds)} ETH
				</div>
				<div className="pb-2 underline-offset-auto">
					All proceeds from your sales can be found here
				</div>
				{proceeds != "0" ? (
					<Button
						onClick={() => {
							runContractFunction({
								params: {
									abi: nftExchangeAbi,
									contractAddress: exchangeAddr,
									functionName: "withdrawProceeds",
									params: {},
								},
								onError: (error) => console.log(error),
								onSuccess: handleWithdrawSuccess,
							});
						}}
						text="Withdraw"
						icon="eth"
					/>
				) : (
					<div>Hmmm 🤔 No proceeds detected. Try listing your NFTs!</div>
				)}
			</div>
		</div>
	);
}

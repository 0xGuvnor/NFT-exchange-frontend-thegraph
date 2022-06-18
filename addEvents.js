const Moralis = require("moralis/node");
require("dotenv").config();
const contractAddresses = require("./constants/networkMapping.json");
const chainId = process.env.chainId;
let moralisChainId = chainId == "31337" ? "0x539" : chainId;
const contractAddress = contractAddresses[chainId]["NftExchange"][0];

const appId = process.env.NEXT_PUBLIC_APP_ID;
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
const masterKey = process.env.masterKey;

async function main() {
	await Moralis.start({ appId, serverUrl, masterKey });
	console.log(`Working with contract address ${contractAddress}`);

	let itemListedOptions = {
		chainId: moralisChainId,
		description: "NFTs Listed",
		sync_historical: true,
		address: contractAddress,
		topic: "ItemListed(address,address,uint256,uint256)",
		abi: {
			anonymous: false,
			inputs: [
				{
					indexed: true,
					internalType: "address",
					name: "seller",
					type: "address",
				},
				{
					indexed: true,
					internalType: "address",
					name: "nftAddr",
					type: "address",
				},
				{
					indexed: true,
					internalType: "uint256",
					name: "tokenId",
					type: "uint256",
				},
				{
					indexed: false,
					internalType: "uint256",
					name: "price",
					type: "uint256",
				},
			],
			name: "ItemListed",
			type: "event",
		},
		tableName: "ItemListed",
	};

	let itemBoughtOptions = {
		chainId: moralisChainId,
		description: "NFTs Bought",
		sync_historical: true,
		address: contractAddress,
		topic: "ItemBought(address,address,uint256,uint256)",
		abi: {
			anonymous: false,
			inputs: [
				{
					indexed: true,
					internalType: "address",
					name: "buyer",
					type: "address",
				},
				{
					indexed: true,
					internalType: "address",
					name: "nftAddr",
					type: "address",
				},
				{
					indexed: true,
					internalType: "uint256",
					name: "tokenId",
					type: "uint256",
				},
				{
					indexed: false,
					internalType: "uint256",
					name: "price",
					type: "uint256",
				},
			],
			name: "ItemBought",
			type: "event",
		},
		tableName: "ItemBought",
	};

	let listingCancelledOptions = {
		chainId: moralisChainId,
		description: "NFT Listings Cancelled",
		sync_historical: true,
		address: contractAddress,
		topic: "ListingCancelled(address,address,uint256)",
		abi: {
			anonymous: false,
			inputs: [
				{
					indexed: true,
					internalType: "address",
					name: "owner",
					type: "address",
				},
				{
					indexed: true,
					internalType: "address",
					name: "nftAddr",
					type: "address",
				},
				{
					indexed: true,
					internalType: "uint256",
					name: "tokenId",
					type: "uint256",
				},
			],
			name: "ListingCancelled",
			type: "event",
		},
		tableName: "ListingCancelled",
	};

	const listedResponse = await Moralis.Cloud.run("watchContractEvent", itemListedOptions, {
		useMasterKey: true,
	});
	const boughtResponse = await Moralis.Cloud.run("watchContractEvent", itemBoughtOptions, {
		useMasterKey: true,
	});
	const cancelledResponse = await Moralis.Cloud.run(
		"watchContractEvent",
		listingCancelledOptions,
		{ useMasterKey: true }
	);

	if (listedResponse.success && boughtResponse.success && cancelledResponse.success) {
		console.log("Success! Database updated with event listeners!");
	} else {
		console.log("Oops! Something went wrong...");
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});

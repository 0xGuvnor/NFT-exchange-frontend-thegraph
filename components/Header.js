import { ConnectButton } from "web3uikit";
import Link from "next/link";

export default function Header() {
	return (
		<nav className="p-5 border-b-2 border-fuchsia-500/100 flex flex-row justify-between items-center">
			<h1 className="px-4 py-4 font-bold text-3xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
				Broad Ocean
			</h1>
			<div className="flex flex-row items-center">
				<Link href="/">
					<a className="mr-4 p-6">Home</a>
				</Link>
				<Link href="/sell-nft">
					<a className="mr-4 p-6">Sell NFT</a>
				</Link>
				<ConnectButton moralisAuth={false} />
			</div>
		</nav>
	);
}

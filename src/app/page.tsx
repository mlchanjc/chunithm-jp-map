import dynamic from "next/dynamic";
import { useMemo } from "react";

export default async function Page() {
	const ChunithmMap = useMemo(
		() =>
			dynamic(() => import("@/components/ChunithmMap"), {
				loading: () => <p>Loading...</p>,
				ssr: false,
			}),
		[]
	);

	let shopList;
	let lastUpdateTime = new Date("Aug 2, 2024");

	try {
		const response = await fetch(`${process.env.API_URL}/api`, {
			next: { revalidate: 3600 },
		});

		if (response.ok) {
			shopList = await response.json();

			const dateHeader = response.headers.get("date");

			if (dateHeader) {
				const date = new Date(dateHeader);
				lastUpdateTime = date;
			}
		}
	} catch (error) {
		console.log(error);
	}

	return (
		<main className="flex items-center justify-center w-screen h-screen">
			<ChunithmMap shopList={shopList} />
			<div className="fixed left-2 bottom-2 z-[999] rounded-xl p-2 bg-white outline-none text-xs">
				{"Last Update: " + lastUpdateTime.toLocaleDateString() + " " + lastUpdateTime.toLocaleTimeString()}
			</div>
		</main>
	);
}

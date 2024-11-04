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

	let shopList = undefined;
	let latestUpdateTime = new Date("Aug 2, 2024");

	try {
		const response = await fetch(`${process.env.API_URL}/api`, {
			next: { revalidate: 86400 },
		});

		if (response.ok) {
			shopList = await response.json();

			const timeFromHeader = response.headers.get("X-Update-Time");
			if (timeFromHeader) {
				latestUpdateTime = new Date(Number(timeFromHeader));
			}
		}
	} catch (error) {
		console.log(error);
	}

	return (
		<main className="flex items-center justify-center w-screen h-screen">
			<ChunithmMap shopList={shopList} latestUpdateTime={latestUpdateTime} />
		</main>
	);
}

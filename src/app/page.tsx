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

	return (
		<main className="flex items-center justify-center w-screen h-screen">
			<ChunithmMap />
		</main>
	);
}

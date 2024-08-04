"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	localStorage.clear();

	return (
		<div className="w-screen h-screen flex flex-col gap-y-6 items-center justify-center">
			<strong className="text-3xl">{error.message}</strong>
			<button className="hover:scale-105 duration-200 text-gray-500 text-2xl" onClick={() => location.reload()}>
				Click Here To Refresh
			</button>
		</div>
	);
}

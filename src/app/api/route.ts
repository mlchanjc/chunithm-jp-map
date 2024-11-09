import { ShopDetail } from "@/types/ShopDetail";
import { HTMLElement, parse } from "node-html-parser";
import { NextResponse } from "next/server";

const BASE_URL = "https://location.am-all.net/alm/";

function extractCoordinates(str: string): [number, number] {
	const parts = str.split("@")[1].split("&")[0].split(",");
	return [Number(parts[0]), Number(parts[1])];
}

function extractMapLink(str: string): string {
	return str.split("'")[1];
}

function extractInfo(infoList: HTMLElement, index: number): string {
	const li = infoList.querySelector(`li:nth-child(${index})`);
	return li?.textContent?.trim() ?? "";
}

async function getShopDetail(subUrl: string): Promise<ShopDetail | null> {
	const response = await fetch(BASE_URL + subUrl);
	if (!response.ok) return null;

	const data = await response.text();
	const doc = parse(data);

	const shopName = doc.querySelector("h3")?.textContent;
	const btnOnClick = doc.querySelector(".bt_google_map_en")?.getAttribute("onclick");
	const infoList = doc.querySelector(".info_list");

	if (!shopName || !btnOnClick || !infoList) return null;

	const [latitude, longitude] = extractCoordinates(btnOnClick);

	const shopDetail: ShopDetail = {
		name: shopName,
		latitude,
		longitude,
		link: extractMapLink(btnOnClick),
		address: extractInfo(infoList, 1),
		businessHours: extractInfo(infoList, 2),
	};

	return shopDetail;
}

function parseShopList(htmlString: string): string[] {
	const doc = parse(htmlString);
	const detailBtns = doc.querySelectorAll(".bt_details_en");
	return Array.from(detailBtns)
		.map((btn) => btn.getAttribute("onclick")?.split("'")[1] || "")
		.filter(Boolean);
}

async function getShopDetailList(shopList: string[]): Promise<ShopDetail[]> {
	const shopDetailPromises = shopList.map(getShopDetail);
	const shopDetails = await Promise.all(shopDetailPromises);
	return shopDetails.filter((detail): detail is ShopDetail => detail !== null);
}

async function fetchShopDetails(): Promise<ShopDetail[]> {
	const shopList: string[] = [];
	const prefectureCount = 47;
	const baseUrl = `${BASE_URL}location?gm=109&lang=en&ct=1000&at=`;

	for (let i = 0; i < prefectureCount; i++) {
		const response = await fetch(`${baseUrl}${i}`);
		if (!response.ok) throw new Error("Failed to fetch shop details");

		const shopHtml = await response.text();
		shopList.push(...parseShopList(shopHtml));
	}

	return await getShopDetailList(shopList);
}

export const GET = async () => {
	try {
		console.log("called");
		const list = await fetchShopDetails();

		return NextResponse.json(list);
	} catch (error) {
		console.error(error);
		return NextResponse.error();
	}
};

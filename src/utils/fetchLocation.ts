import { ShopDetail } from "@/types/ShopDetail";
import { HTMLElement, parse } from "node-html-parser";
import { writeFile } from "fs";

function getMapLink(str: string): string {
	return str.split("'")[1];
}

function getLatitude(str: string): number {
	return Number(str.split("@")[1].split("&")[0].split(",")[0]);
}

function getLongitude(str: string): number {
	return Number(str.split("@")[1].split("&")[0].split(",")[1]);
}

function getAddress(infoList: HTMLElement): string {
	const li = infoList.querySelector("li:first-child");

	const address = li?.textContent?.trim() ?? "";

	return address;
}

function getBusinessHours(infoList: HTMLElement): string {
	const li = infoList.querySelector("li:nth-child(2)");

	const businessHours = li?.textContent?.trim() ?? "";

	return businessHours;
}

async function getShopDetail(subUrl: string): Promise<ShopDetail | null> {
	const baseUrl: string = "https://location.am-all.net/alm/";

	const response = await fetch(baseUrl + subUrl, {
		next: { revalidate: 200 },
	});

	const data = await response.text();

	const doc = parse(data);

	const shopName = doc.querySelector("h3")?.textContent;
	const btnOnClick = doc.querySelector(".bt_google_map_en")?.getAttribute("onclick");
	const infoList = doc.querySelector(".info_list");

	if (!shopName || !btnOnClick || !infoList) return null;

	const shopDetail: ShopDetail = {
		name: shopName,
		longitude: getLongitude(btnOnClick),
		latitude: getLatitude(btnOnClick),
		link: getMapLink(btnOnClick),
		address: getAddress(infoList),
		businessHours: getBusinessHours(infoList),
	};

	return shopDetail;
}

function parseShopList(htmlString: string): string[] {
	const doc = parse(htmlString);

	const detailBtns: HTMLElement[] = doc.querySelectorAll(".bt_details_en");

	const shopList: string[] = Array.from(detailBtns).map((element) => element.getAttribute("onclick")?.split("'")[1] || "");

	return shopList;
}

async function getShopDetailList(shopList: string[]): Promise<ShopDetail[]> {
	const shopDetailPromises = shopList.map((shop) => getShopDetail(shop));
	const shopDetails = await Promise.all(shopDetailPromises);
	return shopDetails.filter((detail): detail is ShopDetail => detail !== null);
}

export async function fetchShopDetails(): Promise<ShopDetail[]> {
	const baseUrl: string = "https://location.am-all.net/alm/location?gm=109&lang=en&ct=1000&at=";

	const shopList: string[] = [];

	const prefectureCount = 47;

	for (let i = 0; i < prefectureCount; i++) {
		const response = await fetch(`${baseUrl}${i}`, {
			next: { revalidate: 200 },
		});

		if (!response.ok) throw Error;
		const shopHtml = await response.text();
		parseShopList(shopHtml).forEach((shop) => {
			if (shop !== "") shopList.push(shop);
		});
	}

	const list = await getShopDetailList(shopList);

	const listString = JSON.stringify(list); // Convert to JSON string

	writeFile("shopList.json", listString, (err) => {
		if (err) throw err;
		console.log("File saved!");
	});

	return list;
}

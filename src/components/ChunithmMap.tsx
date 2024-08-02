"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { ShopDetail } from "@/types/ShopDetail";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Icon, Point } from "leaflet";
import { shopList } from "../../public/shopList";

const customIcon = new Icon({
	iconUrl: "/marker.svg",
	iconRetinaUrl: "/marker.svg",
	iconAnchor: new Point(20, 20),
	popupAnchor: new Point(0, -20),
	iconSize: new Point(40, 40),
});

const ChunithmMap = () => {
	console.log("Shop count: " + shopList.length);

	const initLat = 35.6585;
	const initLng = 139.6422;

	return (
		<MapContainer center={{ lat: initLat, lng: initLng }} zoom={9} scrollWheelZoom={true} zoomControl={false} className="w-full h-full">
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			<MarkerClusterGroup chunkedLoading={true} showCoverageOnHover={false} maxClusterRadius={60}>
				{shopList.map((shop: ShopDetail) => {
					return (
						<Marker key={`Marker ${shop.name}`} position={{ lat: shop.latitude, lng: shop.longitude }} icon={customIcon}>
							<Popup>
								<div className="flex flex-col gap-y-1">
									<div>{shop.name}</div>
									<div>{shop.address}</div>
									<div>{shop.businessHours}</div>
									<a target="_blank" href={shop.link} rel="noopener noreferrer">
										Open in Google Map
									</a>
								</div>
							</Popup>
						</Marker>
					);
				})}
			</MarkerClusterGroup>
		</MapContainer>
	);
};

export default ChunithmMap;

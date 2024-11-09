"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { ShopDetail } from "@/types/ShopDetail";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Icon, LatLng, LocationEvent, Map } from "leaflet";
import { oldShopList } from "../../public/oldShopList";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { checkLocationPermission } from "@/utils/checkLocationPermission";
import { isMobile } from "@/utils/isMobile";

const markerIcon = new Icon({
	iconUrl: "/marker.svg",
	iconRetinaUrl: "/marker.svg",
	iconSize: [45, 60],
	iconAnchor: [22, 50],
	popupAnchor: [0, -45],
});

const peopleIcon = new Icon({
	iconUrl: "/people.svg",
	iconRetinaUrl: "/people.svg",
	iconSize: [35, 51],
	iconAnchor: [18, 39],
	popupAnchor: [0, -35],
});

const defaultPosition = "[35.6585,  139.6422]";
const initPosition = JSON.parse(localStorage.getItem("position") ?? defaultPosition);

const defaultZoom = 7;
const initZoom = isFinite(Number(localStorage.getItem("zoom") ?? defaultZoom)) ? Number(localStorage.getItem("zoom") ?? defaultZoom) : defaultZoom;

const ChunithmMap: React.FC<{ shopList?: ShopDetail[] }> = ({ shopList }) => {
	const [map, setMap] = useState<Map | null>(null);
	const [userPos, setUserPos] = useState<LatLng | null>(null);
	const [data, setData] = useState(shopList ?? oldShopList);

	const onMove = useCallback(() => {
		if (map) {
			localStorage.setItem("position", JSON.stringify([map.getCenter().lat, map.getCenter().lng]));
			localStorage.setItem("zoom", JSON.stringify(map.getZoom()));
		}
	}, [map]);

	const handleLocate = () => {
		checkLocationPermission().then((permissionState) => {
			switch (permissionState) {
				case "granted":
				case "prompt":
					if (isMobile()) {
						navigator.geolocation.getCurrentPosition(
							(position) => {
								const latitude = position.coords.latitude;
								const longitude = position.coords.longitude;
								flyToUser(new LatLng(latitude, longitude));
							},
							(error) => {
								window.alert(error.message);
							},
							{ enableHighAccuracy: false, timeout: 20000 }
						);
					} else {
						map?.locate();
					}
					break;
				case "denied":
					if (navigator.geolocation) {
						window.alert("Please enable location permission");
					} else {
						window.alert("Geolocation is not supported by your browser.");
					}
					break;
			}
		});
	};

	const onLocationFound = (e: LocationEvent) => {
		flyToUser(e.latlng);
	};

	const flyToUser = (latlng: LatLng) => {
		setUserPos(latlng);
		const distanceTo = map!.getCenter().distanceTo(latlng);
		if (distanceTo < 10) return;

		map?.flyTo(latlng, Math.max(17, map.getZoom()), { duration: 0.8, animate: distanceTo < 30000 });
	};

	useEffect(() => {
		console.log("Shop count: " + data.length);
		map?.on("move", onMove);
		map?.on("locationfound", onLocationFound);
		map?.on("locationerror", (e) => {
			window.alert(e.message);
		});
		return () => {
			map?.off("move", onMove);
			map?.off("locationfound", onLocationFound);
			map?.off("locationerror");
		};
	}, [map, onMove]);

	return (
		<>
			<MapContainer center={initPosition} zoom={initZoom} scrollWheelZoom={true} zoomControl={false} className="w-full h-full" ref={setMap}>
				<TileLayer attribution="Google Maps" url="https://www.google.com/maps/vt?lyrs=m&hl=en&x={x}&y={y}&z={z}" />
				{userPos && <Marker position={userPos} icon={peopleIcon}></Marker>}
				<MarkerClusterGroup chunkedLoading={true} showCoverageOnHover={false} maxClusterRadius={60}>
					{data.map((shop: ShopDetail) => {
						return (
							<Marker key={`Marker ${shop.latitude}`} position={{ lat: shop.latitude, lng: shop.longitude }} icon={markerIcon}>
								<Popup>
									<div className="flex flex-col space-y-2">
										<div>{shop.name}</div>
										<div>{shop.address}</div>
										{shop.businessHours !== "" && <div>{shop.businessHours}</div>}
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
			<button
				className="fixed right-4 bottom-7 md:right-16 md:bottom-20 z-[999] rounded-full w-14 h-14 p-1.5 bg-white outline-none"
				onClick={handleLocate}
				title="Show your location"
			>
				<div className="relative w-full h-full active:opacity-70 active:scale-95 duration-100 transition-transform select-none">
					<Image src="/locate.svg" sizes="10" alt="locate" fill draggable={false} />
				</div>
			</button>
		</>
	);
};

export default ChunithmMap;

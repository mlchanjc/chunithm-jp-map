export function checkLocationPermission(): Promise<PermissionState> {
	return new Promise((resolve) => {
		if ("permissions" in navigator) {
			navigator.permissions
				.query({ name: "geolocation" })
				.then((permissionStatus) => {
					resolve(permissionStatus.state);
				})
				.catch(() => {
					resolve("denied");
				});
		}
	});
}

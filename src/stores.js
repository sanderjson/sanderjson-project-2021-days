import { readable, writable } from "svelte/store";

export const errMessage = writable(null);

const tempUserDetailsData = {
	name: "",
	habit: "",
	habitType: null,
	habitCategory: [],
	habitDateStartUTCString: "",
	habitDateEndUTCString: "",
};

const fnIsLocalStorage = () => {
	if (typeof localStorage !== "undefined") {
		try {
			localStorage.setItem("feature_test", "yes");
			if (localStorage.getItem("feature_test") === "yes") {
				localStorage.removeItem("feature_test");
				// localStorage is enabled
				return true;
			} else {
				// localStorage is disabled
				return false;
			}
		} catch (e) {
			// localStorage is disabled
			return false;
		}
	} else {
		// localStorage is not available
		return false;
	}
};

export const tempUserDetails = writable(tempUserDetailsData);
export const tempIsUserDefined = writable(false);
export const isLocalStorage = readable(fnIsLocalStorage);

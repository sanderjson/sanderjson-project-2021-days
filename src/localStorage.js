import { writable } from "svelte-persistent-store/dist/local";

const LSuserAuthData = {
	email: null,
	password: null,
};

const LSuserDetailsData = {
	name: "",
	habit: "",
	habitType: null,
	habitCategory: [],
	habitDateStartUTCString: "",
	habitDateEndUTCString: "",
};

export const LSuserAuth = writable("userAuth", LSuserAuthData);
export const LSuserDetails = writable("userDetails", LSuserDetailsData);
export const LSisUserDefined = writable("isUserDefined", false);

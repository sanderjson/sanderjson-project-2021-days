import { writable } from "svelte-persistent-store/dist/local";

const LSuserAuthData = {
	prop1: null,
	prop2: null,
	prop3: null,
};

const LSuserDetailsData = {
	name: "",
	habit: "",
	habitType: null,
	habitCategory: [],
	habitDateStartUTCString: "",
	habitDateEndUTCString: "",
};

const LSactiveHabitsData = [
	{
		prop1: 1,
	},
	{
		prop1: 1,
	},
	{
		prop1: 1,
	},
];

export const LSisUserDefined = writable("isUserDefined", false);
export const LSuserAuth = writable("userAuth", LSuserAuthData);
export const LSuserDetails = writable("userDetails", LSuserDetailsData);
export const LSactiveHabits = writable("activeHabits", LSactiveHabitsData);

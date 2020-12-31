import { readable, writable } from "svelte/store";

const initActiveUser = {
	name: "Init Data",
	email: null,
	password: "",
	habit: "building apps",
	habitType: true,
	habitCategory: [],
};

export const isSignedIn = writable(false);
export const activeUser = writable(initActiveUser);
export const errMessage = writable(null);

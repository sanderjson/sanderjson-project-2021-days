import ScreenUser from "./routes/ScreenUser.svelte";
import ScreenStart from "./routes/ScreenStart.svelte";
import ScreenSignUp from "./routes/ScreenSignUp.svelte";
import ScreenAbout from "./routes/ScreenAbout.svelte";
import ScreenError from "./routes/ScreenError.svelte";

export default {
	"/": ScreenUser,
	"/start": ScreenStart,
	"/signup": ScreenSignUp,
	"/about": ScreenAbout,
	"/error": ScreenError,
	// "/user/:id": ScreenUser,

	// Using named parameters, with last being optional
	// "/author/:first/:last?": Author,
	// Wildcard parameter
	// "/book/*": Book,
	// Catch-all
	// This is optional, but if present it must be the last
	// "*": NotFound,
};

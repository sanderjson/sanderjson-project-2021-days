import ScreenHome from "./routes/ScreenHome.svelte";
import ScreenLearnMore from "./routes/ScreenLearnMore.svelte";
import ScreenSignUp from "./routes/ScreenSignUp.svelte";
import ScreenUserDetails from "./routes/ScreenUserDetails.svelte";
import ScreenError from "./routes/ScreenError.svelte";

export default {
	"/": ScreenHome,
	"/about": ScreenLearnMore,
	"/start": ScreenSignUp,
	"/user/:id": ScreenUserDetails,
	"/error": ScreenError,

	// Using named parameters, with last being optional
	// "/author/:first/:last?": Author,
	// Wildcard parameter
	// "/book/*": Book,
	// Catch-all
	// This is optional, but if present it must be the last
	// "*": NotFound,
};

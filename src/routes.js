import ScreenUser from "./routes/ScreenUser.svelte";
import ScreenStart from "./routes/ScreenStart.svelte";
import ScreenSignUp from "./routes/ScreenSignUp.svelte";
import ScreenAbout from "./routes/ScreenAbout.svelte";
import ScreenError from "./routes/ScreenError.svelte";
import ScreenHome from "./routes/ScreenHome.svelte";
// import ScreenHabitAddEditDelete from "./routes/ScreenHabitAddEditDelete.svelte";
import ScreenHabitAdd from "./routes/ScreenHabitAdd.svelte";
import ScreenHabitEdit from "./routes/ScreenHabitEdit.svelte";
import ScreenHabitReflect from "./routes/ScreenHabitReflect.svelte";

import ScreenHabitHistory from "./routes/ScreenHabitHistory.svelte";

export default {
	"/": ScreenHome,

	"/start": ScreenStart,
	"/signup": ScreenSignUp,
	"/about": ScreenAbout,
	"/error": ScreenError,
	// "/user/:id": ScreenUser,
	"/add": ScreenHabitAdd,
	"/edit": ScreenHabitEdit,
	"/history": ScreenHabitHistory,
	"/reflect": ScreenHabitReflect,

	// Using named parameters, with last being optional
	// "/author/:first/:last?": Author,
	// Wildcard parameter
	// "/book/*": Book,
	// Catch-all
	// This is optional, but if present it must be the last
	// "*": NotFound,
};

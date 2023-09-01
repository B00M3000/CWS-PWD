// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: User
		}
		interface PageData {
			user?: User
		}
		// interface Platform {}
	}
}

interface User {
	id: string;
	name: string;
	email: string;
	picture: string;
	session_id: string;
	account_type: number;
	access_level: number;
}

export {};

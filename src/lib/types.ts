export interface Person {
	name: string;
	role: string;
	baan: string;
	ex_camp: string;
	gender: string;
	id: number;
	rand?: number;
}

export const GENDER = Object.freeze({
	man: '1',
	woman: '2'
});

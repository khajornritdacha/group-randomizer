export interface Person {
	name: string;
	gender?: string;
	faculty?: string;
	field?: string;
	year?: string;
	section?: string;
	baan?: string;
	status?: string;
	id: number;
}

export type Group = Person[];
export type Day = Group[];
export type Schedule = Day[];

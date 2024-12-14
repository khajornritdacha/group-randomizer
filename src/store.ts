import { writable } from 'svelte/store';
import type { Person } from '$lib/types';
import type { WorkBook } from 'xlsx';

export const data_store = writable<Person[]>([]);
export const leader_store = writable<Person[]>([]);
export const groups_store = writable<Person[][][]>([]);
export const groupOfMembers_store = writable<number[][]>([]);
export const forbiddenPairs_store = writable<string[][]>([])

export const workbook_store = writable<WorkBook | null>(null);

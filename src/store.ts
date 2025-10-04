import { writable } from 'svelte/store';
import type { Person } from '$lib/types';
import type { WorkBook } from 'xlsx';

export const data_store = writable<Person[]>([]);
export const leader_store = writable<Person[]>([]);
export const groups_store = writable<Person[][][]>([]);
export const groupOfMembers_store = writable<number[][]>([]);
export const forbiddenPairs_store = writable<string[][]>([])

// Persistent UI state stores
export const group_cnt_store = writable<number>(0);
export const day_store = writable<number>(1);

export const workbook_store = writable<WorkBook | null>(null);

import { writable } from 'svelte/store';
import type { Person } from '$lib/types';
import type { WorkBook } from 'xlsx';

export const data_store = writable<Person[]>([]);

export const workbook_store = writable<WorkBook | null>(null);

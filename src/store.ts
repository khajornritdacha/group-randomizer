import { writable } from 'svelte/store';
import type { Person } from '$lib/types';

export const data_store = writable<Person[]>([]);

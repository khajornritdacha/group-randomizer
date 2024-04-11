# Group Randomizer

A group randomizer for [Lohit Club](https://www.instagram.com/lohitclub.chula?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==) (Suksa Circles)

## How to use it

1. **Input Format.** This web only accept file in `.xlsx` (excel) format with the following conditions:
   - There is a sheet named `database` with names of members start from Cell A2 (the first column and second row) until it found an empty cell.
2. Select the number of groups and days.
   - The number of groups are mandated to be prime numbers due to Technical conditions.
   - The number of days are any integer from 1 to (the number of groups - 1). i.e. If the number of group is 13, then the maximum number of days is 12.
3. Checkboxes have 2 options:
   - **Download minimal version** - check this to download only the minimal version of the randomized groups. (Does not contain `control` sheet)
   - **Enable Forbidden Pairs** - check this to add forbidden pairs to the randomized groups. [(See below for more information)](#forbidden-pairs)

## Forbidden Pairs

- It is **not guaranteed** that all of the forbidden pairs will not be in the same group. The algorithm will try to avoid the pairs that are on the top of the forbidden-pairs input list first. (If you do not want person A and B in the same group more than person C and D. Then, put pairs A and B on top of the list.)
- Forbidden pairs are pairs of members that should not be in the same group.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev
```

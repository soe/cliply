# Clip.ly
## your personal bookmarking app with a link shortener

**What happens when Bit.ly and Del.icio.us meet?**

Your 2 Web2 favorites are now merged and are launched on decentralized planet!

Away from censorship and walled gardens :)

Tableland and Web3.storage / IPFS give superpower to you to keep and share your favorite linkstou.

No one can ever delete, shut down or take away your links from you anymore :D

![homepage with clips](/screenshots/homepage.png)

![create your own tableland table](/screenshots/create-tableland-table.png)

## deploy your own personal Clip.ly

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsoe%2Fcliply&env=NEXT_PUBLIC_TABLELAND_TABLE_NAME,NEXT_PUBLIC_PROJECT_URL&project-name=cliply-clone&repository-name=cliply-clone)

## Run Clip.ly locally

_copy .env.local.example to .env.local_
```
cp .env.local.example .env.local
```

```
yarn
yarn dev
```

if `NEXT_PUBLIC_TABLELAND_TABLE_NAME` is not set, you can create a table on the homepage.
then once the table is created, update `NEXT_PUBLIC_TABLELAND_TABLE_NAME` in `.env.local` file with the table name.

Then stop the server `ctrl + c` and re-run `yarn dev`.

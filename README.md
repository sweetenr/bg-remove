This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).


## Getting Started

```
use node 18
npm i
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) with your browser to see the result.

There are a number of buttons on the page:

![home](/docs/media/bg-screen.png)

before trying any of these, you'll need to place any folders/files into `public/unprocessed` like below:

![unprocessed](/docs/media/unprocessedFolder.png)

## Reports

`skuReport` & `find failed JPG files` will create a log file in the `public/processed` folder:

![logs](/docs/media/processedLogs.png)

I **Highly** recommend using VS Code so you can format the generated json log files, otherwise they are impossible to read..

## BG Removal

`bulk remove BG` button requires a .env file in the project root

```
API_KEY=yourPhotoRoomAPIKey
```

Make sure your files/folders are in the `public/unprocessed` folder. The script will remove backgrounds from [jpg, JPG, jpeg, JPEG, png, PNG], save the new files with `_pc` appended to the file name, and DELETE the original file.

A Log file will also be generated and placed in the processed folder. In the Log file you can search for "error" to see if any files failed.. You could also simply run the `find failed` script below to generate a log that JUST finds the failed items.

## Troubleshooting

### find failed


### copy failed

### convert failed JPG to PNG

> WARNING: only run this after running `copy failed JPG files`. Those copied files will b in the `public/processed` folder. Then move anything OUT of the `unprocessed` folder and move the newly copied files into `unprocessed`, THEN you can run the script. 

sometimes this works for JPG files that have failed in Photoroom. THis script will convert any JPG files to PNG files with Imagemagick. 
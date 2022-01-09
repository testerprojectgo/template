const WebTorrent = require("webtorrent-hybrid");
const fs = require("fs");
const os = require("os");
const hash = process.argv[2];
const client = new WebTorrent();
const cliProgress = require("cli-progress");
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.rect);

if (!hash) {
  console.log("You must enter your torrent link as an argument");
  console.log("./torrent-downloader-cli LINK");
  process.exit();
}

try {
  client.add(hash, (torrent) => {
    const files = torrent.files;
    let length = files.length;
    console.log(`Files Count: ${length}`);
    bar.start(100, 0);
    let interval = setInterval(() => {
      bar.update(torrent.progress * 100);
    }, 1000);
    files.forEach((file) => {
      const source = file.createReadStream();
      const dest = fs.createWriteStream(
        `data/${file.name}`
      );
      source
        .on("end", () => {
          console.log(`\n----\nfile "${file.name}" downloaded.\n`);
          length -= 1;
          if (!length) {
            bar.stop();
            clearInterval(interval);
            process.exit();
          }
        })
        .pipe(dest);
    });
  });
} catch (err) {
  console.error(`Error: ${err}`);
}
import { readFileSync, readdirSync, unlinkSync, writeFileSync } from "fs";
import { Auction } from "./Auction";
import { generateBuyers } from "./BuyerSecondPlace";
import { fork } from "child_process";

const makeWorkerPromise = () =>
    new Promise((res) => {
        const worker = fork("./worker.ts");
        worker.on("exit", (message) => {
            res(message);
        });
    });

readdirSync("./outputs").forEach((file) => {
    unlinkSync(`./outputs/${file}`);
});

const workers = [];
for (let i = 0; i < 10; i++) {
    workers.push(makeWorkerPromise());
}

(async () => {
    const results = await Promise.all(workers);
    console.log("Done, Aggregating results...");
    // read all files in outputs
    const dir = readdirSync("./outputs");
    const allResults = [] as any;
    const goodResults = [] as any;
    dir.forEach((file) => {
        const raw = readFileSync(`./outputs/${file}`, "utf-8").toString();
        if (!raw) return;
        const data = JSON.parse(raw);
        allResults.push(...data.raw);
        allResults.push(...data.raw2);
        if (Object.values(data.goodResults).length)
            goodResults.push({
                file: file,
                result: data.goodResults,
            });
    });
    writeFileSync("count.txt", "0");
    // writeFileSync("allResults.json", JSON.stringify(allResults));
    writeFileSync("allRawResults.json", JSON.stringify(allResults));
    if (goodResults.length) {
        writeFileSync("goodResults.json", JSON.stringify(goodResults));
    }
})();

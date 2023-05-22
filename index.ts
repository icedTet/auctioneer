import { readFileSync, readdirSync, unlinkSync, writeFileSync } from "fs";
import { Auction } from "./Auction";
import { BuyerJSON } from "./Buyer";
import { fork } from "child_process";
type WorkerResponse = {
  allResults: { [k: string]: number };
  goodResults: {
    [k: string]: BuyerJSON;
  };
  raw: BuyerJSON[] | null;
  revenue: number;
};
const makeWorkerPromise = () =>
  new Promise((res) => {
    const worker = fork("./worker.ts");
    worker.on("message", (message) => {
      const wMsg = message as WorkerResponse;
      res(wMsg);
    });
    // worker.on("exit", (message) => {
    //   res(message);
    // });
  }) as Promise<WorkerResponse>;
// readdirSync("./outputs").forEach((file) => {
//   unlinkSync(`./outputs/${file}`);
// });
const workers = [];
for (let i = 0; i < 50; i++) {
  workers.push(makeWorkerPromise());
}

(async () => {
  const results = await Promise.all(workers);
  console.log("Done, Aggregating results...");
  // read all files in outputs
  // const dir = readdirSync("./outputs");
  const allResults = [] as WorkerResponse["raw"];
  const goodResults = [] as WorkerResponse["raw"];
  results.forEach((result) => {
    const data = result;
    allResults?.push(...(data.raw || []));
    if (Object.values(data.goodResults).length)
      goodResults?.push(
        ...Object.values(data.goodResults).map((x) => ({
          ...x,
        }))
      );
  });
  writeFileSync("count.txt", "0");
  // writeFileSync("allResults.json", JSON.stringify(allResults));
  writeFileSync("allRawResults.json", JSON.stringify(allResults));
  if (goodResults?.length) {
    writeFileSync("goodResults.json", JSON.stringify(goodResults));
  }
})();

console.log("Running...");

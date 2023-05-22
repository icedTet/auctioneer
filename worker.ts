import { writeFile } from "fs/promises";
import { Auction, FPSBAuction, SPSBAuction } from "./Auction";
import { generateBuyers, generateSecondPlaceBuyers } from "./BuyerSecondPlace";
import { nanoid } from "nanoid";
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "fs";


for (let a = 0; a < 50; a++) {
  const buyers = generateBuyers(50, 5000, 200, 200);
  const secondPlaceBuyers = generateSecondPlaceBuyers(50, 5000, 200, 200);
  const auction = new SPSBAuction(buyers, secondPlaceBuyers, 100);
  let auctionRounds = 100;
  for (let i = 0; i < auctionRounds; i++) {
    auction.run();
  }
  const results = auction.results(10,true);
  const currCount = ~~readFileSync("count.txt", "utf-8").toString();
  writeFileSync("count.txt", `${currCount + 1}`);
  writeFile(
    `outputs/${nanoid()}-${currCount}.json`,
    JSON.stringify(results)
  ).then((x) => {
    process.exit(0);
  });
}

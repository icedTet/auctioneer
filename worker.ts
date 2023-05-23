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

const allRes = [];
for (let a = 0; a < 50; a++) {
    const buyers = generateBuyers(50, 5000, 200, 200);
    const secondPlaceBuyers = generateSecondPlaceBuyers(50, 5000, 200, 200);
    const auction = new SPSBAuction(buyers, secondPlaceBuyers, 100);
    let auctionRounds = 10;
    for (let i = 0; i < auctionRounds; i++) {
        auction.run();
    }
    const results = auction.results(10, true);
    allRes.push(results);
}

process.send?.(allRes);
console.log("Done Worker");
setTimeout(() => {
    process.exit(0);
}, 1000);

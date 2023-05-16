import { Buyer } from "./Buyer";

// Purpose: Defines the Auction for blind bidding
export class Auction {
  buyers: Map<string, Buyer>; // The buyers in the auction
  itemValue: number; // The value of the item being auctioned
  revenue: number; // The revenue of the auction
  constructor(buyers: Buyer[], itemValue: number) {
    this.buyers = new Map();
    buyers.forEach((buyer) => {
      this.buyers.set(buyer.id, buyer);
    });
    this.itemValue = itemValue;
    this.revenue = 0;
  }
  // Purpose: Runs the auction
  run(): void {
    // Create bids
    this.buyers.forEach((buyer) => {
      buyer.createBid();
    });
    // Accept bids
    const highestBid = this.findHighestBidder();
    if (!highestBid) return;
    // console.log("Highest Bidder: ", highestBid.id);
    this.revenue += highestBid.bid;
    highestBid.acceptBid();

    // Reject bids
    this.buyers.forEach((buyer) => {
      if (buyer.id !== highestBid.id) {
        buyer.rejectBid();
      }
    });

    // Reroll bidding multipliers
    this.buyers.forEach((buyer) => {
      buyer.rerollBiddingMultiplier();
    });
  }
  findHighestBidder(): Buyer {
    let highestBid = 0;
    let highestBidder: Buyer | null = null;
    this.buyers.forEach((buyer) => {
      if (buyer.bid > highestBid) {
        highestBid = buyer.bid;
        highestBidder = buyer;
      }
    });
    return highestBidder!;
  }
  results(winRequirement: number, full: boolean) {
    // sort by highest satiety
    const sortedBuyers = Array.from(this.buyers.values()).sort(
      (a, b) => b.satiety - a.satiety
    );
    // sortedBuyers.slice(0, 5).forEach((buyer) => {
    //   console.log(
    //     `Buyer ${buyer.id} bought ${buyer.satiety} items for a total of ${buyer.wallet} dollars`
    //   );
    // });
    // count how many buyers bought the item
    let satietyMap = new Map();
    let goodMap = new Map<string, Object>();
    sortedBuyers.forEach((buyer) => {
      satietyMap.set(buyer.satiety, (satietyMap.get(buyer.satiety) || 0) + 1);
      if (buyer.satiety >= winRequirement) {
        goodMap.set(buyer.id, buyer.toJSON());
      }
    });
    // console.log({
    //   allResults: Object.fromEntries(satietyMap.entries()),
    //   goodResults: Object.fromEntries(goodMap.entries()),
    // });
    return {
      allResults: Object.fromEntries(satietyMap.entries()),
      goodResults: Object.fromEntries(goodMap.entries()),
      raw: full ? sortedBuyers.map((x) => x.toJSON()) : null,
      revenue: this.revenue,
    };

    // const largeBuyers = sortedBuyers.filter((buyer) => buyer.satiety >= 4);
    // console.log(
    //   `There were ${largeBuyers.length} buyers who bought more than 4 items`
    // );
    // const semilargeBuyers = sortedBuyers.filter((buyer) => buyer.satiety === 3);
    // console.log(
    //   `There were ${semilargeBuyers.length} buyers who bought 3 items`
    // );
    // const mediumBuyers = sortedBuyers.filter((buyer) => buyer.satiety === 2);
    // console.log(`There were ${mediumBuyers.length} buyers who bought 2 items`);
    // const smallBuyers = sortedBuyers.filter((buyer) => buyer.satiety === 1);
    // console.log(`There were ${smallBuyers.length} buyers who bought 1 item`);
    // const tinyBuyers = sortedBuyers.filter((buyer) => buyer.satiety === 0);
    // console.log(`There were ${tinyBuyers.length} buyers who bought  0 items`);
    // // broke buyers
    // const brokeBuyers = sortedBuyers.filter((buyer) => buyer.broke);
    // console.log(`There were ${brokeBuyers.length} buyers who went broke`);
  }
}

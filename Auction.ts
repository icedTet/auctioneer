import { BuyerSecondPlace } from "./BuyerSecondPlace";
import { Buyer, BuyerJSON } from "./Buyer";

export interface Auction {
  buyers: Map<string, Buyer>; // The buyers in the auction
  itemValue: number; // The value of the item being auctioned
  revenue: number; // The revenue of the auction
  run(): void;
  results(winRequirement: number, full: boolean): Object;
}

// FPSBAuction = First Price Sealed Bid Auction
// SPSBAuction = Second Price Sealed Bid Auction

// Purpose: Defines the Auction for blind bidding
export class FPSBAuction implements Auction {
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
    let satietyMap = new Map();
    let goodMap = new Map<string, BuyerJSON>();
    sortedBuyers.forEach((buyer) => {
      satietyMap.set(buyer.satiety, (satietyMap.get(buyer.satiety) || 0) + 1);
      if (buyer.satiety >= winRequirement) {
        goodMap.set(buyer.id, buyer.toJSON());
      }
    });
    return {
      allResults: Object.fromEntries(satietyMap.entries()),
      goodResults: Object.fromEntries(goodMap.entries()),
      raw: full ? sortedBuyers.map((x) => x.toJSON()) : null,
      revenue: this.revenue,
    };
  }
}

export class SPSBAuction extends FPSBAuction implements Auction {
    secondPlaceBuyers: Map<string, BuyerSecondPlace>;

    constructor(
        buyers: Buyer[],
        secondPlaceBuyers: BuyerSecondPlace[],
        itemValue: number
    ) {
        super(buyers, itemValue);

        this.secondPlaceBuyers = new Map();
        secondPlaceBuyers.forEach((BuyerSecondPlace) => {
            this.secondPlaceBuyers.set(BuyerSecondPlace.id, BuyerSecondPlace);
        });
    }

    // previously findHighestBidders(): [Buyer, Buyer]
    findHighestBidders() {
        let highestBid = 0;
        let secondHighestBid = 0;

        let highestBidder: Buyer | null = null;
        let secondHighestBidder: Buyer | null = null;

        this.buyers.forEach((buyer) => {
            if (buyer.bid > highestBid) {
                highestBid = buyer.bid;
                highestBidder = buyer;
            } 
        });
        this.buyers.forEach((buyer) => {
            if (buyer.bid > secondHighestBid && buyer.id !== highestBidder?.id) {
                secondHighestBid = buyer.bid;
                secondHighestBidder = buyer;
            }
        });

        this.secondPlaceBuyers.forEach((secondPlaceBuyer) => {
            if (secondPlaceBuyer.bid > secondHighestBid) {
                if (secondPlaceBuyer.bid > highestBid) {
                    secondHighestBid = highestBid;
                    secondHighestBidder = highestBidder;

                    highestBid = secondPlaceBuyer.bid;
                    highestBidder = secondPlaceBuyer;
                } else {
                    secondHighestBid = secondPlaceBuyer.bid;
                    secondHighestBidder = secondPlaceBuyer;
                }
            }
        });
        return [highestBidder!, secondHighestBidder!];
    }

    // Purpose: Runs the auction
    run(): void {
        this.buyers.forEach((buyer) => {
            buyer.createBid();
        });
        this.secondPlaceBuyers.forEach((secondPlaceBuyer) => {
            secondPlaceBuyer.createBid();
        });

        // Accept bids
        const [highestBid, secondHighestBid] = this.findHighestBidders();
        if (!highestBid) return;
        // console.log("Highest Bidder: ", highestBid.id);
        this.revenue += highestBid.bid;
        highestBid.acceptBid(highestBid.bid);

        // Reject bids
        if (highestBid instanceof BuyerSecondPlace) {
            this.secondPlaceBuyers.forEach((secondPlaceBuyer) => {
                if (secondPlaceBuyer.id !== highestBid.id) {
                    secondPlaceBuyer.rejectBid();
                }
            });
            this.buyers.forEach((buyer) => {
                buyer.rejectBid();
            });
        } else {
            this.buyers.forEach((buyer) => {
                if (buyer.id !== highestBid.id) {
                    buyer.rejectBid();
                }
            });
            this.secondPlaceBuyers.forEach((secondPlaceBuyer) => {
                secondPlaceBuyer.rejectBid();
            });
        }
    }

    results(winRequirement: number, full: boolean) {
        // sort by highest satiety
        const sortedBuyers = Array.from(this.buyers.values()).sort(
            (a, b) => b.satiety - a.satiety
        );
        const sortedSecondPlaceBuyers = Array.from(
            this.secondPlaceBuyers.values()
        ).sort((a, b) => b.satiety - a.satiety);

        let satietyMap = new Map();
        let goodMap = new Map<string, BuyerJSON>();
        sortedBuyers.forEach((buyer) => {
            satietyMap.set(buyer.satiety, (satietyMap.get(buyer.satiety) || 0) + 1);
            if (buyer.satiety >= winRequirement) {
                goodMap.set(buyer.id, buyer.toJSON());
            }
        });

        sortedSecondPlaceBuyers.forEach((secondPlaceBuyer) => {
            satietyMap.set(
                secondPlaceBuyer.satiety,
                (satietyMap.get(secondPlaceBuyer.satiety) || 0) + 1
            );
            if (secondPlaceBuyer.satiety >= winRequirement) {
                goodMap.set(secondPlaceBuyer.id, secondPlaceBuyer.toJSON());
            }
        });

        return {
            allResults: Object.fromEntries(satietyMap.entries()),
            goodResults: Object.fromEntries(goodMap.entries()),
            raw: full ? sortedBuyers.map((x) => x.toJSON()) : null,
            raw2: full ? sortedSecondPlaceBuyers.map((x) => x.toJSON()) : null,
            revenue: this.revenue,
        };
    }
}

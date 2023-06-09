import { nanoid } from "nanoid";

export type BuyerJSON = {
    subjectiveValue: number;
    bid: number;
    wallet: number;
    satiety: number;
    broke: boolean;
    id: string;
    bids: {
        bid: number;
        accepted: boolean;
    }[]
};

export class Buyer {
    subjectiveValue: number; // The buyer's subjective value for the item
    bid: number; // The buyer's bid for the item
    wallet: number; // The buyer's wallet (how much money they have left)
    satiety: number; // The buyer's satiety (how much they have bought so far)
    broke?: boolean; // Whether the buyer is broke
    id: string; // The buyer's id
    bids: {
        bid: number;
        accepted: boolean;
    }[];

    constructor(subjectiveValue: number, wallet: number) {
        this.subjectiveValue = Math.max(subjectiveValue, 0) + 50;
        // If the bidding multiplier is not provided, set it to a random, normally distributed number from 0.5 to 1.5

        this.wallet = wallet;
        this.id = nanoid(42);
        this.satiety = 0;
        this.bid = 0;
        this.createBid();
        this.bids = [];
    }

    // Purpose: Sets the buyer's bid, up to the amount of money they have left
    createBid(): void {
        this.bid = Math.min(this.subjectiveValue, this.wallet);
    }

    acceptBid(bidAmount?: number): void {
        this.wallet -= bidAmount ?? this.bid;
        this.satiety += 1;
        if (this.wallet <= 0) {
            this.broke = true;
        }
        this.bids.push({
            bid: this.bid,
            accepted: true,
        });
    }

    rejectBid(): void {
        this.bids.push({
        bid: this.bid,
        accepted: false,
        });
    }

    toJSON() {
        return {
            subjectiveValue: this.subjectiveValue,
            bid: this.bid,
            wallet: this.wallet,
            satiety: this.satiety * this.subjectiveValue + this.wallet,
            // previously (this.satiety > 0 ? this.wallet / (this.subjectiveValue * 5) : 0)
            broke: !!this.broke,
            id: this.id,
            bids: this.satiety > 5050 ? this.bids : [] , //this.bids,
            secondPlace: false,
        };
    }
}
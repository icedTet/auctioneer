import { Buyer } from "./Buyer";
import probabaility from "probability-distributions";

export class BuyerSecondPlace extends Buyer {
    buyers = 100;

    createBid(): void {
        // this.bid = Math.min((this.buyers-1)/(this.buyers)*this.subjectiveValue + 1, this.wallet);
        this.bid = Math.min(this.subjectiveValue, this.wallet);
    }

    toJSON() {
        return {
            subjectiveValue: this.subjectiveValue,
            bid: this.bid,
            wallet: this.wallet,
            satiety: this.satiety * this.subjectiveValue + this.wallet,
            broke: !!this.broke,
            id: this.id,
            bids: this.satiety > 5050 ? this.bids : [] , //this.bids,
            secondPlace: true,
        };
    }
}

export const generateBuyers = (
    numBuyers: number,
    wallet: number,
    subjectiveValue: number,
    subjectiveValueVariation: number,
) => {
    const buyers: Buyer[] = [];
    const probs = probabaility.rnorm(
        numBuyers,
        subjectiveValue,
        subjectiveValueVariation
    );
    for (let i = 0; i < numBuyers; i++) {
        buyers.push(new Buyer(probs[i], wallet));
    }
    return buyers;
};

// create generateBuyers for BuyerSecondPlace!!
export const generateSecondPlaceBuyers = (
    numBuyers: number,
    wallet: number,
    subjectiveValue: number,
    subjectiveValueVariation: number,
) => {
    const buyers: BuyerSecondPlace[] = [];
    const probs = probabaility.rnorm(
        numBuyers,
        subjectiveValue,
        subjectiveValueVariation
    );
    for (let i = 0; i < numBuyers; i++) {
        buyers.push(new BuyerSecondPlace(probs[i], wallet));
    }
    return buyers;
};

import { Buyer } from "./Buyer";

export class BuyerSecondPlace extends Buyer {
    buyers = 0;

    setNumBuyers(buyers: number): void {
        this.buyers = buyers;
    }

    setBid(bid: number): void {
        this.bid = (this.buyers+1)/(this.buyers-1)*bid
    }
}
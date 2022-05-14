import sdk from './1-initialize-sdk.js';
import { MaxUint256 } from '@ethersproject/constants';

const editionDrop = sdk.getEditionDrop('0x6a583B583f2dD4cb3F70250B5501C2a5bd1A0950');

(async () => {
  try {
    // Define claim conditions, this is an array of objects because can have multiple phases starting at different times if need to
    const claimConditions = [{
      // When ppl are gonna be able to start claiming the NFTs (now)
      startTime: new Date(),
      // The maximum number of NFTs that can be claimed
      maxQuantity: 50_000,
      // The price of NFT (free)
      price: 0,
      // The amount of NFTs ppl can claim in one transaction
      quantityLimitPerTransaction: 1,
      // Set the wait between transactions to MaxUint256, which means people are only allowe to claim once
      waitInSeconds: MaxUint256,
    }]

    await editionDrop.claimConditions.set("0", claimConditions);
    console.log('✅ Successfully set claim condition!')
  } catch (error) {
    console.log('Failed to set claim condition', error)
  }
})();
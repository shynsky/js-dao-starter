import sdk from './1-initialize-sdk.js';
import {readFileSync} from 'fs';

const editionDrop = sdk.getEditionDrop('0x6a583B583f2dD4cb3F70250B5501C2a5bd1A0950');

(async() => {
  try {
    await editionDrop.createBatch([
      {
        name: "Crazyness",
        description: "This NFT will give you access to ManiaDAO",
        image: readFileSync('scripts/assets/crazy.png'),
      }
    ]);
    console.log('✅ Successfuly created a new NFT in the drop!');
  } catch (error) {
    console.error("Failed to create the new NFT :(", error)
  }
})();
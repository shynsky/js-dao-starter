import sdk from './1-initialize-sdk.js'

// This is the address to our ERC-1155 membership NFT contract
const editionDrop = sdk.getEditionDrop('0x6a583B583f2dD4cb3F70250B5501C2a5bd1A0950')

// This is the address to our ERC-20 token contract
const token = sdk.getToken('0x103ea38d8B31CDfa07BAC2CB3517d07a4822aB61')

;(async () => {
  try {
    // Grab all the addresses of people who own our membership NFT, which has a tokenId of 0
    const walletAddresses = await editionDrop.history.getAllClaimerAddresses(0)

    if (walletAddresses.length === 0) {
      console.log('🤖 No NFTs have been claimed yet, maybe get some friends to claim your free NFTs')
      process.exit(0)
    }

    // Loop through the array of addresses
    const airdropTargets = walletAddresses.map((address) => {
      // Pick a random # between 1000 and 10000
      const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000)
      console.log('✅ Going to airdrop', randomAmount, ' tokens to ', address)

      // Set up a target
      const airdropTarget = {
        toAddress: address,
        amount: randomAmount,
      }

      return airdropTarget
    })

    // Call transferBatch on all our airdrop targets
    console.log('🌈 Starting airdrop...')
    await token.transferBatch(airdropTargets)
    console.log('✅ Successfully airdropped token to all the holders of the NFT!')
  } catch (error) {
    console.error('🛑 Failed to airdrop tokens ', error)
  }
})()

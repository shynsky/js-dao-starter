import sdk from './1-initialize-sdk.js'

// This is our governance contract
const vote = sdk.getVote('0x7fe21e67Ef57A2c4B0618A1e2006b35a73e0C170')

// This is ERC-20 contract
const token = sdk.getToken('0x103ea38d8B31CDfa07BAC2CB3517d07a4822aB61')

;(async () => {
  try {
    // Give our treasury the power to mint additional token if needed
    await token.roles.grant('minter', vote.getAddress())

    console.log('✅ Successfully gave vote contract permissions to act on token contract')
  } catch (error) {
    console.error('🛑 Failed to grant vote contract permissions on token contract ', error)
    process.exit(1)
  }
  try {
    // Grab wallet's token balance, it'll hold basically the entire supply right now
    const ownedTokenBalance = await token.balanceOf(process.env.WALLET_ADDRESS)

    // Grab 90% of the supply that is helt
    const ownedAmount = ownedTokenBalance.displayValue
    const percent90 = (Number(ownedAmount) / 100) * 90

    // Transfer 90% of the supply to the voting contract
    await token.transfer(vote.getAddress(), percent90)

    console.log('✅ Successfully transferred ' + percent90 + ' tokens to vote contract')
  } catch (error) {
    console.error('🛑 Failed to transfer tokens to vote contract, error')
  }
})()

import sdk from './1-initialize-sdk.js'
import { ethers } from 'ethers'

// This is our governance contract
const vote = sdk.getVote('0x7fe21e67Ef57A2c4B0618A1e2006b35a73e0C170')

// This is our ERC-20 contract
const token = sdk.getToken('0x103ea38d8B31CDfa07BAC2CB3517d07a4822aB61')

;(async () => {
  try {
    // Create proposal to mint 420k new token to the treasurey
    const amount = 420_000
    const description = `Should the DAO mint an additional ${amount} tokens into the treasury, to chill out?`
    const executions = [
      {
        // Our token contract that actually executes the mint
        toAddress: token.getAddress(),
        // Out nativeToken is ETH. nativeTokenValue is the amount of ETH we want to send in this proposal.
        // In this case, we're sending 0 ETH. We're just minting new tokens to the treasury.
        nativeTokenValue: 0,
        // We're doing a mint. And, we're minting to the vote, which is acting as our treasury.
        // In this case, we need to use ethers.js to convert the amount to the correct format.
        // This is because the amount it requires is in wei.
        transactionData: token.encoder.encode('mintTo', [vote.getAddress(), ethers.utils.parseUnits(amount.toString(), 18)]),
      },
    ]

    await vote.propose(description, executions)

    console.log('✅ Successfully created proposal to mint tokens.')
  } catch (error) {
    console.error('🛑 Failed to create a proposal', error)
    process.exit(1)
  }

  try {
    // Create proposal to transfer ourselves 6,900 tokens for being awesome
    const amount = 6_900
    const description = `Should the DAO transfer ${amount} tokens from the treasuryto ${process.env.WALLET_ADDRESS} for being awesome?`
    const executions = [
      {
        // Again, we're sending ourselves 0 ETH. Just sending our own token.
        nativeTokenValue: 0,
        transactionData: token.encoder.encode(
          // We're doing a transfer from the treasury to our wallet
          'transfer',
          [process.env.WALLET_ADDRESS, ethers.utils.parseUnits(amount.toString(), 18)]
        ),
        toAddress: token.getAddress(),
      },
    ]

    await vote.propose(description, executions)

    console.log("✅ Successfully create proposal to reward ourselves from the treasury, let's hope people vote for it!")
  } catch (error) {
    console.log('🛑 Damn, failed to create second proposal', error)
  }
})()

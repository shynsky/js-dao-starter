import sdk from './1-initialize-sdk.js'

// This is the address of ERC-20 contract printed out in the step before.
const token = sdk.getToken('0x103ea38d8B31CDfa07BAC2CB3517d07a4822aB61')

;(async () => {
  try {
    const amount = 10000000
    // Interact with deployed ERC-20 contract and mint the tokens
    await token.mint(amount)
    const totalSupply = await token.totalSupply()

    // Print out how many of the token's are out there now
    console.log('✅ There now is', totalSupply.displayValue, '$MANIA in circulation')
  } catch (error) {
    console.error('🛑 Failed to print the money', error)
  }
})()

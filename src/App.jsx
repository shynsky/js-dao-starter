import { useAddress, useMetamask, useEditionDrop, useToken } from '@thirdweb-dev/react'
import { useState, useEffect, useMemo } from 'react'

const App = () => {
  // Use the hooks thirdweb give us.
  const address = useAddress()
  const connectWithMetamask = useMetamask()
  console.log('👋 Address:', address)

  // Initialize our editionDrop contract
  const editionDrop = useEditionDrop('0x6a583B583f2dD4cb3F70250B5501C2a5bd1A0950')
  // Initialize our token contract
  const token = useToken('0x103ea38d8B31CDfa07BAC2CB3517d07a4822aB61')
  // State variable for us to know if user has our NFT
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false)
  // isClaiming lets us easily keep a loading state while the NFT is minting
  const [isClaiming, setIsClaiming] = useState(false)
  // Holds the amount of token each member has in state
  const [memberTokenAmounts, setMemberTokenAmounts] = useState([])
  // The array holding all of our members addresses
  const [memberAddresses, setMemberAddresses] = useState([])

  // Addresses shortener
  const shortenAddress = (str) => {
    return str.substring(0, 6) + '...' + str.substring(str.length - 4)
  }

  // This useEffect grabs all the addresses of our members holding our NFT
  useEffect(() => {
    if (!hasClaimedNFT) {
      return
    }

    // Just like with 7-airdrop-token file: grab the users who hold our NFT with tokenId 0
    const getAllAddressess = async () => {
      try {
        const memberAddresses = await editionDrop.history.getAllClaimerAddresses(0)
        setMemberAddresses(memberAddresses)
        console.log('🚀 Members addresses ', memberAddresses)
      } catch (error) {
        console.error('failed to get member list ', error)
      }
    }
    getAllAddressess()
  }, [hasClaimedNFT, editionDrop.history])

  // This useEffect grabs the # of token each member holds
  useEffect(() => {
    if (!hasClaimedNFT) {
      return
    }

    const getAllBalances = async () => {
      try {
        const amounts = await token.history.getAllHolderBalances()
        setMemberTokenAmounts(amounts)
        console.log('👜 Amounts ', amounts)
      } catch (error) {
        console.error('🛑 failed to get member balances ', error)
      }
    }
    getAllBalances()
  }, [hasClaimedNFT, token.history])

  // Now, combine the memberAddresses and memberTokenAmounts into a single array
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      // We're checking if we are finding the address in the memberTokenAmounts array
      // If we are, we'll return the amount of token the user has
      // Otherwise, return 0
      const member = memberTokenAmounts?.find(({ holder }) => holder === address)

      return {
        address,
        tokenAmount: member?.balance.displayValue || '0',
      }
    })
  }, [memberAddresses, memberTokenAmounts])

  useEffect(() => {
    // If they don't have a connected wallet, exit
    if (!address) {
      return
    }

    const checkBalance = async () => {
      try {
        const balance = await editionDrop.balanceOf(address, 0)
        if (balance.gt(0)) {
          setHasClaimedNFT(true)
          console.log('🌟 this user has a membership NFT')
        } else {
          setHasClaimedNFT(false)
          console.log("😭 this user doesn't have a membership NFT")
        }
      } catch (error) {
        setHasClaimedNFT(false)
        console.log('Failed to get the balance', error)
      }
    }
    checkBalance()
  }, [address, editionDrop])

  const mintNft = async () => {
    try {
      setIsClaiming(true)
      await editionDrop.claim('0', 1)
      console.log(`🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${editionDrop.getAddress()}/0`)
      setHasClaimedNFT(true)
    } catch (error) {
      setHasClaimedNFT(false)
      console.log('Failed to mint NFT', error)
    } finally {
      setIsClaiming(false)
    }
  }

  // This is the case where the user hasn't connected their wallet
  // to your web app. Let them call connectWallet.
  if (!address) {
    return (
      <div className='landing'>
        <h1>Welcome to NarutoDAO</h1>
        <button onClick={connectWithMetamask} className='btn-hero'>
          Connect your wallet
        </button>
      </div>
    )
  }

  if (hasClaimedNFT) {
    return (
      <div className='member-page'>
        <h1>🍪 DAO Member Page</h1>
        <p>Congratulations on being a member</p>
        <div>
          <div>
            <h2>Member List</h2>
            <table className='card'>
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // // This is the case where we have the user's address
  // // which means they've connected their wallet to our site!
  // return (
  //   <div className='landing'>
  //     <h1>👀 wallet connected, now what!</h1>
  //   </div>
  // )

  // render mint nft screen
  return (
    <div className='mint-nft'>
      <h1>Mint your free 🍪 DAO Membership NFT</h1>
      <button disabled={isClaiming} onClick={mintNft}>
        {isClaiming ? 'Minting...' : "Mint your NFT (it's free)"}
      </button>
    </div>
  )
}

export default App

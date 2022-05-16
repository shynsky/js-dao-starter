import { useAddress, useMetamask, useEditionDrop, useToken, useVote, useNetwork } from '@thirdweb-dev/react'
import { useState, useEffect, useMemo } from 'react'
import { AddressZero } from '@ethersproject/constants'
import { ChainId } from '@thirdweb-dev/sdk'

const App = () => {
  // Use the hooks thirdweb give us.
  const address = useAddress()
  const network = useNetwork()
  const connectWithMetamask = useMetamask()
  console.log('👋 Address:', address)

  // Initialize our editionDrop contract
  const editionDrop = useEditionDrop('0x6a583B583f2dD4cb3F70250B5501C2a5bd1A0950')
  // Initialize our token contract
  const token = useToken('0x103ea38d8B31CDfa07BAC2CB3517d07a4822aB61')
  // Get vote for DAO governance
  const vote = useVote('0x7fe21e67Ef57A2c4B0618A1e2006b35a73e0C170')
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

  const [proposals, setProposals] = useState([])
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)

  // Retrieve all our existing proposals from the contract
  useEffect(() => {
    if (!hasClaimedNFT) {
      return
    }

    // A simple call to vote.getAll() to grap the proposals
    const getAllProposals = async () => {
      try {
        const proposals = await vote.getAll()
        setProposals(proposals)
        console.log('🌈 Proposals: ', proposals)
      } catch (error) {
        console.log('🛑 Failed to get the proposals ', error)
      }
    }
    getAllProposals()
  }, [hasClaimedNFT, vote])

  // We also need to check if user has already voted
  useEffect(() => {
    if (!hasClaimedNFT) {
      return
    }

    // If we haven't finished retrieving the proposals from the useEffect above
    // then we can't check if the user voted yet.
    if (!proposals.length) {
      return
    }

    const checkIfUserHasVoted = async () => {
      try {
        const hasVoted = await vote.hasVoted(proposals[0].proposalId, address)
        setHasVoted(hasVoted)
        if (hasVoted) {
          console.log('🧐 User has already voted')
        } else {
          console.log('📝 User has not voted yet')
        }
      } catch (error) {
        console.error('🛑 Failed to check if wallet has voted ', error)
      }
    }
    checkIfUserHasVoted()
  }, [hasClaimedNFT, proposals, address, vote])

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

  if (address && network?.[0].data.chain.id !== ChainId.Rinkeby) {
    return (
      <div className='unsupported-network'>
        <h2>Please connect to Rinkeby</h2>
        <p>This dapp only works on the Rinkeby network, please switch networks in your connected wallet.</p>
      </div>
    )
  }

  // This is the case where the user hasn't connected their wallet
  // to your web app. Let them call connectWallet.
  if (!address) {
    return (
      <div className='landing'>
        <h1>Welcome to ManiaDAO</h1>
        <button onClick={connectWithMetamask} className='btn-hero'>
          Connect your wallet
        </button>
      </div>
    )
  }

  if (hasClaimedNFT) {
    return (
      <div className='member-page'>
        <h1>🍪 Mania DAO Member Page</h1>
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
          <div>
            <h2>Active Proposals</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                e.stopPropagation()

                // Before we do async things, we want to disable the button to prevent double clicks
                setIsVoting(true)

                // Let's get the votes from the form for the values
                const votes = proposals.map((proposal) => {
                  const voteResult = {
                    proposalId: proposal.proposalId,
                    // abstain by default
                    vote: 2,
                  }
                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(proposal.proposalId + '-' + vote.type)

                    if (elem.checked) {
                      voteResult.vote = vote.type
                      return
                    }
                  })
                  return voteResult
                })

                // first we need to make sure the user delegates their token to vote
                try {
                  // we'll check if the wallet still needs to delegate their tokens before they can vote
                  const delegation = await token.getDelegationOf(address)
                  // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
                  if (delegation === AddressZero) {
                    // if they haven't delegated their tokens yet, we'll have delegate them before voting
                    await token.delegateTo(address)
                  }
                  // then we need to vote on the proposals
                  try {
                    await Promise.all(
                      votes.map(async ({ proposalId, vote: _vote }) => {
                        // before voting we first need to check whether the rpoposal is open for voting
                        // we first need to get the latest state of the proposal
                        const proposal = await vote.get(proposalId)
                        // then we check if the proposal is open for voting (state === 1 means it is open)
                        if (proposal.state === 1) {
                          // if it is open for voting, we'll vote on it
                          return vote.vote(proposalId, _vote)
                        }
                        // if the proposal is not open for voting we just return nothing, letting us continue
                        return
                      })
                    )
                    try {
                      // if any of the proposals are ready to be executed we'll need to execute them
                      // a proposal is ready to be executed if tt is in state 4
                      await Promise.all(
                        votes.map(async ({ proposalId }) => {
                          // we'll first get the latest state of the proposal agai, since we may have just voted before
                          const proposal = await vote.get(proposalId)

                          // if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                          if (proposal.state === 4) {
                            return vote.execute(proposalId)
                          }
                        })
                      )
                      // if we get here that means we successfully voted, so let's set hasVoted to true
                      setHasVoted(true)
                      // and log out a success msg
                      console.log('📝 Successfully voted!')
                    } catch (error) {
                      console.error('🛑 Failed to execute votes', error)
                    }
                  } catch (error) {
                    console.error('🛑 Failed to vote ', error)
                  }
                } catch (error) {
                  console.error('🛑 Failed to delegate the tokens')
                } finally {
                  // in *either* case we need to set the isVoting state to false to enbale the button agian
                  setIsVoting(true)
                }
              }}
            >
              {proposals.map((proposal) => (
                <div key={proposal.proposalId} className='card'>
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map(({ type, label }) => (
                      <div key={type}>
                        <input
                          type='radio'
                          id={proposal.proposalId + '-' + type}
                          name={proposal.proposalId}
                          value={type}
                          // default the "abstain" vote to checked
                          defaultChecked={type === 2}
                        />
                        <label htmlFor={proposal.proposalId + '-' + type}>{label}</label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type='submit'>
                {isVoting ? 'Voting...' : hasVoted ? 'You already voted' : 'Submit votes'}
              </button>
              {!hasVoted && <small>This will trigger multiple transations that you will need to sign.</small>}
            </form>
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

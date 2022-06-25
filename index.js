import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
connectButton.onclick = connect

const fundButton = document.getElementById("fundButton")
fundButton.onclick = fund

const balanceButton = document.getElementById("balanceButton")
balanceButton.onclick = getContractBalance

const withdrawButton = document.getElementById("withdrawButton")
withdrawButton.onclick = withdraw

const balanceField = document.getElementById("balance")

console.log(ethers)

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        console.log("I see a Metamask!")
        await window.ethereum.request({ method: "eth_requestAccounts" })
        console.log("Connected!")
        connectButton.innerHTML = "Connected"
    } else {
        connectButton.innerHTML = "Please install Metamask!"
    }
}

// fund function
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        // provider / connection to blockchain
        // signer / wallet / someone with gas
        // contract that we are interacting with (Address and ABI)
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}

async function getContractBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)

        try {
            const balance = await provider.getBalance(contractAddress)
            balanceField.value = ethers.utils.formatEther(balance)
            console.log(`Contract Balance: ${balanceField}`)
        } catch (error) {
            console.log(error)
        }
    } else {
        connectButton.innerHTML = "Please install Metamask!"
    }
    return
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        // provider / connection to blockchain
        // signer / wallet / someone with gas
        // contract that we are interacting with (Address and ABI)
        console.log(`Withdrawing ${getContractBalance()} from contract...`)
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

// withdraw

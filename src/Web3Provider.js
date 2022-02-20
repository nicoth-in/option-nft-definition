import Web3 from "web3";
import React, {useState, useEffect} from "react";
import detectEthereumProvider from '@metamask/detect-provider';


async function isMetamaskConnected() {
    const provider = await detectEthereumProvider();
    return (provider !== undefined);
}

function connectAccount(handleAccountsChanged) {
    window.ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(handleAccountsChanged)
      .catch((error) => {
        if (error.code === 4001) {
          // EIP-1193 userRejectedRequest error
          console.log('Please connect to MetaMask.');
        } else {
          console.error(error);
        }
      });
}

function useWeb3() {
    const [web3State, setWeb3State] = useState(null);

    const authWeb3 = async () => {
         // Wait for loading completion to avoid race conditions with web3 injection timing.
        if (window.ethereum) {
            const web3 = new Web3(window.ethereum);
            try {
            // Request account access if needed
            await window.ethereum.enable();
            // Acccounts now exposed
            return web3;
            } catch (error) {
            console.error(error);
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            // Use Mist/MetaMask's provider.
            const web3 = window.web3;
            console.log('Injected web3 detected.');
            return web3;
        }
        // Fallback to localhost; use dev console port by default...
        else {
            const provider = new Web3.providers.HttpProvider('wss://mainnet.infura.io/ws/v3/0abfac0d1f354185903fcdd9d98b96aa');
            const web3 = new Web3(provider);
            console.log('No web3 instance injected, using Local web3.');
            return web3;
        }
    }
    useEffect(() => {
        //window.addEventListener('load', async () => {
        async function execute() {
            const web3 = await authWeb3();
            setWeb3State(web3);
        }
        execute();
        //});
    }, [setWeb3State]);

    return web3State;
}



// let web3 = new Web3('wss://mainnet.infura.io/ws/v3/0abfac0d1f354185903fcdd9d98b96aa');
// console.log(web3);

export { useWeb3, connectAccount, isMetamaskConnected };
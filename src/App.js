import React, { useEffect, useState } from "react";
import { useWeb3, connectAccount } from "./Web3Provider";
import { getNFTsByOwner } from "./RaribleApi";
import styles from "./Styles.module.css";
import abi from "./abi.json";

function LoginPage({ callback }) {

  const login = () => {
    connectAccount(onConnected);
  };

  const onConnected = (ethAddrList) => {
    callback(ethAddrList[0]);
  }

  return (
    <div className={styles.MintCard}>
      <h1 className={styles.Header}>Login to your account</h1>
      <button className={styles.BigButton} onClick={login}>Auth wallet</button>
    </div>
  )
}

function ListTokens({ setActiveNFT, ownedNFTs, activeNFT }) {

  
  const [showList, setShowList] = useState(false);

  return (
    <div className={styles.SelectionGuide}>
      <div className={styles.SelectedNFT} onClick={_ => setShowList(!showList)}>
        {activeNFT.name}
      </div>

      {(showList) ? <div className={styles.Selection}>
        {ownedNFTs.map(
          (k, i) => <>
            <p className={styles.SelectionItem} key={i} onClick={() => { setActiveNFT({ name: (!!k.meta) ? k.meta.name : "No name given", id: k.tokenId, contract: k.contract }); setShowList(false); }}>
              {(!!k.meta) ? k.meta.name : "No name given"}
              <br />
              <span className={styles.NftId}>{k.id}</span>
            </p>
          </>
        )}
      </div> : null}
    </div>
  )
}

function MintPage({ addr, web3 }) {

  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [activeNFT, setActiveNFT] = useState({ name: "Select your NFT to convert.." });

  useEffect(() => {
    getNFTsByOwner(addr).then(
      r => setOwnedNFTs(r.items)
    );
  }, [setOwnedNFTs, addr]);

  const mintNFT = async (tokenAddr, tokenId) => {

    console.log(tokenAddr, tokenId);

    const optionAddress = "0x3f83752167a7DA47A86308C3FB55d005Ba750b9c";
    const nftContract = new web3.eth.Contract(abi, tokenAddr);
    const optionContract = new web3.eth.Contract(abi, optionAddress);

    const tx_a = {
      'from': addr,
      'to': tokenAddr,
      'gas': '500000',
      'data': nftContract.methods.approve(optionAddress, tokenId).encodeABI()
    };
    
    const tx = {
      'from': addr,
      'to': optionAddress,
      'gas': '500000',
      'data': optionContract.methods.safeMint(tokenAddr, tokenId, 10, 99999999999999).encodeABI()
    };

    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [tx_a],
    });
    console.log(txHash);
    
    const txHash2 = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [tx],
    });
    console.log(txHash2);

  };
  
  return (
    <>
      <div className={styles.MintCard}>
        <h1 className={styles.Header}>Convert your NFT to an Option contract</h1>
        <ListTokens activeNFT={activeNFT} setActiveNFT={setActiveNFT} ownedNFTs={ownedNFTs} />
        <input className={styles.SmallInputField} type="text" placeholder="Strike price" />
        <input className={styles.SmallInputField} type="text" placeholder="Expire date" />
        <button onClick={() => mintNFT(activeNFT.contract, activeNFT.id)} className={styles.BigButton}>Mint Option!</button>
      </div>
    </>
  )
}

 

function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [userAddr, setUserAddr] = useState(false);
  const web3 = useWeb3();

  const authDone = (addr) => {
    setUserAddr(addr);
    // 
    setLoggedIn(true);
  }

  return (
    <div className={styles.Container}>
      {(loggedIn) ? <MintPage addr={userAddr} web3={web3} /> : <LoginPage callback={authDone} />}
    </div>
  );
}

export default App;

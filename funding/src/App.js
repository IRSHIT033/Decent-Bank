import { useState, useEffect } from "react";
import "./App.css";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { loadContract } from "./utils/load-contract";
import Lottie from "lottie-react";
import BankAnime from "./Lottie_Animations/bankAnimeation.json"
function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    contract: null,
  });

  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [reload, shouldReload] = useState(false);

  const reloadEffect = () => shouldReload(!reload);
  const setAccountListener = (provider) => {
    provider.on("accountsChanged", (accounts) => setAccount(accounts[0]));
  };
  useEffect(() => {
    const loadProvider = async () => {
      const provider = await detectEthereumProvider();
      const contract = await loadContract("Funder", provider);
      if (provider) {
        setAccountListener(provider);
        provider.request({ method: "eth_requestAccounts" });
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract,
        });
      } else {
        console.error("Please install MetaMask!");
      }
      // if (window.ethereum) {
      //   provider = window.ethereum;
      //   try {
      //     await provider.enable();
      //   } catch {
      //     console.error("User is not allowed");
      //   }
      // } else if (window.web3) {
      //   provider = window.web3.currentProvider;
      // } else if (!process.env.production) {
      //   provider = new Web3.providers.HttpProvider("http://localhost:7545");
      // }
    };

    loadProvider();
     
  }, []);

  useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } = web3Api;
      const balance = await web3.eth.getBalance(contract.address);
      setBalance(web3.utils.fromWei(balance, "ether"));
    };
    web3Api.contract && loadBalance();
   
  }, [web3Api, reload]);

  const transferFund = async () => {
    const { web3, contract } = web3Api;
    await contract.transfer({
      from: account,
      value: web3.utils.toWei("2", "ether"),
    });
    reloadEffect();
  };

  const withdrawFund = async () => {
    const { web3 ,contract} = web3Api;
    const withdrawAmout = web3.utils.toWei("2", "ether");
    await contract.withdraw(withdrawAmout, {
      from: account,
    });
    reloadEffect();
  };

  useEffect(() => {
    const getAccount = async () => {
      const accounts = await web3Api.web3.eth.getAccounts();
      setAccount(accounts[0]);
    };
    web3Api.web3 && getAccount();
  }, [web3Api.web3]);

  // console.log(web3Api.web3);
  return (
    <>
     <div className="Main-container">
       <div className="Text-container">
         <h1>DECENT BANK</h1>
         <p>Its time to get Decentralized with DECENT BANK.</p>
        
         </div>
        <div className="pic" >
        <Lottie  animationData={BankAnime} loop="true" autoplay="true"/>
        </div>
        </div>


        <div className="Main-container">
        <div className="Card-container">
          <h2 >Balance: {balance} ETH </h2>
          <p >
            Account : {account ? account : "not connected"}
          </p>
         
          &nbsp;
          <div className="flex-apart">
          <button type="button" className="my-btn "  onClick={transferFund}>
            Transfer
          </button>
          &nbsp;
          <button type="button" className="my-btn " onClick={withdrawFund}>
            Withdraw
          </button>
          </div>
        </div>
        </div>
    
    </>
  );
}

export default App;

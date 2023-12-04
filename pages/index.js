import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import QrCode from "qrcode.react"; // Import the QR code library
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [recentNotification, setRecentNotification] = useState(undefined);
  const [notifications, setNotifications] = useState([]);
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(new ethers.providers.Web3Provider(window.ethereum));
    }
  };

  const handleAccount = async () => {
    if (ethWallet) {
      const accounts = await ethWallet.listAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        getATMContract();
      }
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    try {
      await ethWallet.send("eth_requestAccounts");
      handleAccount();
    } catch (error) {
      console.error("Error connecting account:", error);
    }
  };

  const getATMContract = () => {
    const signer = ethWallet.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const balance = await atm.getBalance();
      setBalance(balance.toNumber());
    }
  };

  const deposit = async () => {
    if (atm && depositAmount > 0) {
      try {
        const tx = await atm.deposit(depositAmount);
        await tx.wait();
        getBalance();
        const newNotification = createNotification(
          "Deposit",
          depositAmount
        );
        setRecentNotification(newNotification);
        updateNotifications(newNotification);
        setDepositAmount(0); // Reset deposit amount after successful deposit
      } catch (error) {
        console.error("Deposit failed:", error);
      }
    }
  };

  const withdraw = async () => {
    if (atm && withdrawAmount > 0) {
      try {
        const tx = await atm.withdraw(withdrawAmount);
        await tx.wait();
        getBalance();
        const newNotification = createNotification(
          "Withdrawal",
          withdrawAmount
        );
        setRecentNotification(newNotification);
        updateNotifications(newNotification);
        setWithdrawAmount(0); // Reset withdraw amount after successful withdrawal
      } catch (error) {
        console.error("Withdrawal failed:", error);
      }
    }
  };

  const createNotification = (type, amount) => {
    return {
      id: notifications.length + 1,
      message: `${type} of ${amount} ETH at ${new Date().toLocaleTimeString()} on ${new Date().toLocaleDateString()}`,
    };
  };

  const updateNotifications = (newNotification) => {
    setNotifications([...notifications, newNotification]);
  };

  const initUser = () => {
    // Check to see if the user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask to use this ATM.</p>;
    }

    // Check to see if the user is connected. If not, connect to their account
    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your Metamask wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <label>
          Deposit Amount (ETH):
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
        </label>
        <button style={{ backgroundColor: "blue" }} onClick={deposit}>
          Deposit
        </button>
        <br />
        <label>
          Withdraw Amount (ETH):
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
        </label>
        <button style={{ backgroundColor: "yellow" }} onClick={withdraw}>
          Withdraw
        </button>
      </div>
    );
  };

  const NotificationSection = () => (
    <div>
      <h2>Recent Notification</h2>
      {recentNotification && <p>{recentNotification.message}</p>}
      {notifications.length > 0 && (
        <div>
          <h2>All Notifications</h2>
          <p>Scan the QR code below to view all notifications:</p>
          <QrCode value={JSON.stringify(notifications)} />
        </div>
      )}
    </div>
  );

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <NotificationSection />
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}


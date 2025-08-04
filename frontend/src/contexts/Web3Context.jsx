import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import toast from 'react-hot-toast';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [paymentRequirements, setPaymentRequirements] = useState(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum;
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.');
      return { success: false, error: 'MetaMask not installed' };
    }

    setIsConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const account = accounts[0];
      
      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Get network info
      const network = await provider.getNetwork();
      
      setProvider(provider);
      setSigner(signer);
      setAccount(account);
      setNetwork(network);
      
      toast.success('Wallet connected successfully!');
      return { success: true, account };
    } catch (error) {
      console.error('Wallet connection error:', error);
      const message = error.code === 4001 ? 'User rejected connection' : 'Failed to connect wallet';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setNetwork(null);
    toast.success('Wallet disconnected');
  };

  // Get payment requirements
  const getPaymentRequirements = async () => {
    try {
      const response = await axios.get('/api/payments/requirements');
      setPaymentRequirements(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to get payment requirements:', error);
      return null;
    }
  };

  // Send payment transaction
  const sendPayment = async (paymentDetails) => {
    if (!signer || !account) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      // Extract payment details
      const { to, amount, currency } = paymentDetails;
      
      if (!to || !amount || !currency) {
        return { success: false, error: 'Invalid payment details' };
      }

      // Convert amount to wei
      const amountWei = ethers.parseEther(amount.toString());
      
      // Create transaction
      const tx = {
        to: to,
        value: amountWei
      };

      // Estimate gas
      const gasEstimate = await signer.estimateGas(tx);
      const gasPrice = await provider.getFeeData();
      
      // Send transaction
      const transaction = await signer.sendTransaction({
        ...tx,
        gasLimit: gasEstimate,
        gasPrice: gasPrice.gasPrice
      });

      toast.success('Payment transaction sent! Waiting for confirmation...');
      
      // Wait for confirmation
      const receipt = await transaction.wait();
      
      toast.success('Payment confirmed!');
      
      return {
        success: true,
        transactionHash: receipt.hash,
        amount: amount,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Payment error:', error);
      const message = error.code === 4001 ? 'Transaction rejected' : 'Payment failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Verify payment transaction
  const verifyPayment = async (transactionHash, amount) => {
    try {
      const response = await axios.post('/api/payments/verify', {
        transactionHash,
        amount
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Payment verification error:', error);
      const message = error.response?.data?.error || 'Payment verification failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Get network status
  const getNetworkStatus = async () => {
    try {
      const response = await axios.get('/api/payments/network-status');
      return response.data;
    } catch (error) {
      console.error('Network status error:', error);
      return null;
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          disconnectWallet();
        } else {
          // User switched accounts
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = () => {
        // Reload page when chain changes
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (isMetaMaskInstalled() && window.ethereum.selectedAddress) {
        await connectWallet();
      }
    };

    autoConnect();
  }, []);

  const value = {
    provider,
    signer,
    account,
    network,
    isConnecting,
    paymentRequirements,
    isMetaMaskInstalled,
    connectWallet,
    disconnectWallet,
    sendPayment,
    verifyPayment,
    getPaymentRequirements,
    getNetworkStatus,
    isConnected: !!account
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};
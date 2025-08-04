const express = require('express');
const { ethers } = require('ethers');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Admin wallet address (in production, this would be stored securely)
const ADMIN_WALLET = process.env.ADMIN_WALLET || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';

// Initialize provider (use testnet for development)
const getProvider = () => {
  const network = process.env.ETHEREUM_NETWORK || 'sepolia';
  const apiKey = process.env.INFURA_API_KEY || 'your-infura-api-key';
  
  if (network === 'mainnet') {
    return new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/${apiKey}`);
  } else {
    return new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${apiKey}`);
  }
};

// Verify payment transaction
router.post('/verify', auth, async (req, res) => {
  try {
    const { transactionHash, amount } = req.body;

    if (!transactionHash || !amount) {
      return res.status(400).json({ error: 'Transaction hash and amount are required' });
    }

    const provider = getProvider();
    
    // Get transaction details
    const tx = await provider.getTransaction(transactionHash);
    if (!tx) {
      return res.status(400).json({ error: 'Transaction not found' });
    }

    // Verify transaction is confirmed
    const receipt = await provider.getTransactionReceipt(transactionHash);
    if (!receipt || receipt.status !== 1) {
      return res.status(400).json({ error: 'Transaction not confirmed or failed' });
    }

    // Verify recipient is admin wallet
    if (tx.to?.toLowerCase() !== ADMIN_WALLET.toLowerCase()) {
      return res.status(400).json({ error: 'Invalid recipient address' });
    }

    // Verify amount (convert from wei to ETH)
    const txAmount = parseFloat(ethers.formatEther(tx.value));
    const expectedAmount = parseFloat(amount);
    
    if (Math.abs(txAmount - expectedAmount) > 0.0001) { // Allow small tolerance
      return res.status(400).json({ error: 'Amount mismatch' });
    }

    // Verify sender matches user's wallet
    if (tx.from?.toLowerCase() !== req.user.walletAddress?.toLowerCase()) {
      return res.status(400).json({ error: 'Transaction sender does not match user wallet' });
    }

    res.json({
      verified: true,
      transactionHash,
      amount: txAmount,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Server error verifying payment' });
  }
});

// Get payment requirements
router.get('/requirements', auth, async (req, res) => {
  try {
    const network = process.env.ETHEREUM_NETWORK || 'sepolia';
    const platformFee = network === 'mainnet' ? 0.001 : 0.0001; // Lower fee for testnet
    
    res.json({
      adminWallet: ADMIN_WALLET,
      platformFee,
      network,
      currency: 'ETH',
      minConfirmations: 1
    });
  } catch (error) {
    console.error('Get payment requirements error:', error);
    res.status(500).json({ error: 'Server error getting payment requirements' });
  }
});

// Get user's payment history
router.get('/history', auth, async (req, res) => {
  try {
    const payments = req.user.paymentHistory || [];
    
    res.json({
      payments: payments.map(payment => ({
        jobId: payment.jobId,
        amount: payment.amount,
        transactionHash: payment.transactionHash,
        timestamp: payment.timestamp
      }))
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Server error getting payment history' });
  }
});

// Estimate gas for payment
router.post('/estimate-gas', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const provider = getProvider();
    const amountWei = ethers.parseEther(amount.toString());
    
    // Create a dummy transaction to estimate gas
    const dummyTx = {
      to: ADMIN_WALLET,
      value: amountWei
    };

    const gasEstimate = await provider.estimateGas(dummyTx);
    
    // Get current gas price
    const gasPrice = await provider.getFeeData();
    
    res.json({
      gasLimit: gasEstimate.toString(),
      gasPrice: gasPrice.gasPrice?.toString(),
      estimatedCost: (parseFloat(ethers.formatEther(gasEstimate * gasPrice.gasPrice)) + parseFloat(amount)).toFixed(6)
    });
  } catch (error) {
    console.error('Gas estimation error:', error);
    res.status(500).json({ error: 'Server error estimating gas' });
  }
});

// Get network status
router.get('/network-status', async (req, res) => {
  try {
    const provider = getProvider();
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    res.json({
      network: network.name,
      chainId: network.chainId,
      blockNumber: blockNumber.toString(),
      adminWallet: ADMIN_WALLET
    });
  } catch (error) {
    console.error('Network status error:', error);
    res.status(500).json({ error: 'Server error getting network status' });
  }
});

module.exports = router; 
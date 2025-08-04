# MongoDB Compass Setup Guide

## 🎯 Why Use MongoDB Compass?

MongoDB Compass is a GUI tool that makes it easy to:
- ✅ Test your MongoDB Atlas connection
- ✅ View and edit your data
- ✅ Verify your connection string
- ✅ Debug connection issues

## 📥 Download MongoDB Compass

1. Go to [MongoDB Compass Download](https://www.mongodb.com/try/download/compass)
2. Download the version for your operating system (Windows/Mac/Linux)
3. Install and open MongoDB Compass

## 🔧 Connect to MongoDB Atlas

### Step 1: Get Your Connection String

1. Go to your MongoDB Atlas dashboard
2. Click on your cluster
3. Click "Connect"
4. Choose "Connect using MongoDB Compass"
5. Copy the connection string

### Step 2: Configure Connection String

Your connection string should look like this:
```
mongodb+srv://username:password@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

**Important:** Replace `<password>` with your actual password.

### Step 3: Connect in Compass

1. Open MongoDB Compass
2. Paste your connection string in the URI field
3. Click "Connect"
4. If successful, you'll see your databases

## 🧪 Test Your Connection

Once connected in Compass:

1. **Create a test database:**
   - Click "Create Database"
   - Database Name: `job-portal`
   - Collection Name: `test`

2. **Insert test data:**
   - Click on the `test` collection
   - Click "Add Data" → "Insert Document"
   - Add: `{"test": "connection", "timestamp": "2024-01-01"}`

3. **Verify it works:**
   - You should see your test document in the collection

## 🔄 Update Your .env File

Once Compass connects successfully, update your `.env` file with the same connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.abc123.mongodb.net/job-portal?retryWrites=true&w=majority
```

**Note:** Add `/job-portal` at the end to specify the database name.

## 🚀 Test Your Application

After confirming Compass works:

```bash
# Test the connection
node setup-mongodb.js

# Start the server
npm start
```

## 🔍 Troubleshooting

### If Compass can't connect:

1. **Check Network Access:**
   - Go to Atlas → Network Access
   - Add your IP address or use `0.0.0.0/0`

2. **Verify Credentials:**
   - Check username and password
   - Make sure there are no special characters in password

3. **Check Cluster Status:**
   - Ensure your cluster is running
   - Check if it's not paused

### If Compass connects but app doesn't:

1. **Check connection string format**
2. **Verify database name is correct**
3. **Ensure all environment variables are set**

## 📋 Next Steps

1. ✅ Connect to Atlas via Compass
2. ✅ Test creating/reading data
3. ✅ Update your `.env` file
4. ✅ Test your application
5. ✅ Start building your job portal!

---

**🎉 Once Compass connects successfully, your application should work too!** 
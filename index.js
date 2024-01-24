const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors= require('cors');
const Ticker =require('./models/dataModel')
const dotenv=require('dotenv');
const app = express();
const connectDB= require('./config/db')

app.use(express.json())
app.use(cors());
dotenv.config();
// Connect to MongoDB
connectDB();


app.get('/fetch-and-insert', async (req, res) => {
    try {
        // Fetch data from WazirX API
        const apiURL = 'https://api.wazirx.com/api/v2/tickers';
        const response = await axios.get(apiURL);
        const tickersData = response.data;

        // Extract the top 10 tickers
        const top10Tickers = Object.values(tickersData).slice(0, 10);

        // Transform and insert data into MongoDB collection
        const formattedTickers = top10Tickers.map(ticker => ({
            name: ticker.name,
            last: parseFloat(ticker.last),
            buy: parseFloat(ticker.buy),
            sell: parseFloat(ticker.sell),
            volume: parseFloat(ticker.volume),
            base_unit: ticker.base_unit,
        }));

        await Ticker.insertMany(formattedTickers);
        console.log("Data sent")
        res.json({ status: 'success', message: 'Top 10 tickers inserted into MongoDB' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.get('/', async (request, response) => {
    try {
      Ticker.find().then(tickers=>response.json(tickers));
  
    } catch (error) {
      console.log(error.message);
      response.status(500).send({ message: error.message });
    }
  });

  const PORT=process.env.PORT || 8080
// Start the Express server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

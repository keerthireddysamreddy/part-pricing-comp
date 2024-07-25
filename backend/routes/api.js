const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

const convertCurrency = (price, currency) => {
    if (currency === 'USD') return price * 84;
    if (currency === 'EUR') return price * 90;
    return price;
};

const fetchMouserData = async (partNumber, volume) => {
    const apiKey = process.env.MOUSER_API_KEY; 
    const url = `https://api.mouser.com/api/v1/search/partnumber?apiKey=${apiKey}`;
    const requestBody = {
        SearchByPartRequest: {
            mouserPartNumber: partNumber,
            partSearchOptions: ""
        }
    };

    try {
        const response = await axios.post(url, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const products = response.data.SearchResults.Parts || [];

        return products.map(product => {
            let unitPrice = 0;
            if (product.PriceBreaks) {
                product.PriceBreaks.forEach(priceBreak => {
                    if (volume >= priceBreak.Quantity) {
                        unitPrice = parseFloat(priceBreak.Price.replace("₹", ""));
                    }
                });
            }

            let totalPrice = unitPrice * volume
            totalPrice = totalPrice.toFixed(4);

            return {
                partNumber: product.ManufacturerPartNumber || partNumber,
                manufacturer: product.Manufacturer || 'Unknown Manufacturer',
                provider: 'MOUSER',
                volume,
                unitPrice: unitPrice,
                totalPrice: totalPrice
            };
        });
    } catch (error) {
        console.error('Error fetching data from Mouser:', error);
        return [];
    }
};

const fetchRutronikData = async (partNumber, volume) => {
    const apiKey = process.env.RUTRONIK_API_KEY; 
    const url = `https://www.rutronik24.com/api/search/?apikey=${apiKey}&searchterm=${partNumber}`;

    try {
        const response = await axios.get(url);

        const products = response.data || []; 
        return products.map(product => ({
            partNumber: product.partNumber || partNumber,
            manufacturer: product.manufacturer || 'Unknown Manufacturer',
            provider: 'RUTRONIK',
            volume,
            unitPrice: convertCurrency(product.price || 0, 'EUR'),
            totalPrice: (convertCurrency(product.price || 0, 'EUR') * volume).toFixed(4)
        }));
    } catch (error) {
        console.error('Error fetching data from Rutronik:', error);
        return [];
    }
};

const fetchElement14Data = async (partNumber, volume) => {
    const apiKey = process.env.ELEMENT14_API_KEY;
    const url = `https://api.element14.com/catalog/products?term=manuPartNum:${partNumber}&storeInfo.id=in.element14.com&resultsSettings.offset=0&resultsSettings.numberOfResults=1&resultsSettings.refinements.filters=inStock&resultsSettings.responseGroup=medium&callInfo.omitXmlSchema=false&callInfo.callback=&callInfo.responseDataFormat=json&callInfo.apiKey=${apiKey}`;

    try {
        const response = await axios.get(url);

        const products = response.data.manufacturerPartNumberSearchReturn.products || [];

        // Process the results similarly
        return products.map(product => {
            // Find the price for the given volume
            let unitPrice = 0;
            product.prices.forEach(priceTier => {
                if (volume >= priceTier.from && volume <= priceTier.to) {
                    unitPrice = priceTier.cost;
                }
            });

            let totalPrice = unitPrice * volume
            totalPrice = totalPrice.toFixed(4);

            return {
                partNumber: product.displayName || partNumber,
                manufacturer: product.vendorName || 'Unknown Manufacturer',
                provider: 'ELEMENT14',
                volume,
                unitPrice: unitPrice,
                totalPrice: totalPrice
            };
        });

    } catch (error) {
        console.error('Error fetching data from Element14:', error);
        return [];
    }
};



router.post('/search', async (req, res) => {
    const { partNumber, volume } = req.body;
    console.log(`Searching for part number: ${partNumber}, volume: ${volume}`);

    try {
       
        const mouserData = await fetchMouserData(partNumber, volume);
        // console.log('Fetched Mouser Data:', mouserData);

        const rutronikData = await fetchRutronikData(partNumber, volume);
        // console.log('Fetched Rutronik Data:', rutronikData);

        const element14Data = await fetchElement14Data(partNumber, volume);
        // console.log('Fetched Element14 Data:', element14Data);

    
        const data = [...mouserData, ...rutronikData, ...element14Data];
        console.log('Combined Data:', data);

  
        const sortedData = data.sort((a, b) => a.totalPrice - b.totalPrice);
        console.log('Sorted Data:', sortedData);

        res.json(sortedData);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Error fetching data' });
    }
});

let cart = [];

router.get('/cart', (req, res) => {
    res.json(cart);
});

router.post('/cart', (req, res) => {
    const { partNumber, manufacturer, provider, volume, unitPrice, totalPrice } = req.body;
    const existingItemIndex = cart.findIndex(item => item.partNumber === partNumber && item.provider === provider);
    if (existingItemIndex > -1) {
        cart[existingItemIndex] = { partNumber, manufacturer, provider, volume, unitPrice, totalPrice };
    } else {
        cart.push({ partNumber, manufacturer, provider, volume, unitPrice, totalPrice });
    }
    res.json(cart);
});

router.put('/cart', (req, res) => {
    const { partNumber, provider, volume } = req.body;
    const existingItemIndex = cart.findIndex(item => item.partNumber === partNumber && item.provider === provider);
    if (existingItemIndex > -1) {
        const item = cart[existingItemIndex];
        item.volume = volume;
        item.totalPrice = (item.unitPrice * volume).toFixed(4);
    }
    res.json(cart);
});


module.exports = router;
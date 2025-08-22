const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '/')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const axios = require('axios');
const xml2js = require('xml2js');

app.get('/search', async (req, res) => {
    const gameName = req.query.name;
    if (!gameName) {
        return res.status(400).send('A game name is required.');
    }

    try {
        // Search for the game by name to get its ID
        const searchUrl = `https://boardgamegeek.com/xmlapi/search?search=${encodeURIComponent(gameName)}`;
        const searchResponse = await axios.get(searchUrl);

        const searchResult = await xml2js.parseStringPromise(searchResponse.data);
        if (!searchResult.boardgames.boardgame || searchResult.boardgames.boardgame.length === 0) {
            return res.status(404).send('Game not found.');
        }

        const gameId = searchResult.boardgames.boardgame[0].$.objectid;

        // Get the game details using the ID
        const gameUrl = `https://boardgamegeek.com/xmlapi/boardgame/${gameId}`;
        const gameResponse = await axios.get(gameUrl);

        const gameResult = await xml2js.parseStringPromise(gameResponse.data);
        const description = gameResult.boardgames.boardgame[0].description[0];

        res.send(description);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching data from the BoardGameGeek API.');
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

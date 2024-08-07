/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

const functions = require("firebase-functions")
const axios = require("axios")
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

admin.initializeApp();

const supabaseURL = process.env.SUPABASE_URL;
const supabaseKEY = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseURL, supabaseKEY);

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

async function getRecentPuzzleID() {
    const puzzleResp = await axios.get("https://www.nytimes.com/svc/crosswords/v3/puzzles.json");
    const puzzleInfo = puzzleResp.data.results[0];
    const puzzleId = puzzleInfo.puzzle_id;
    return puzzleId;
}

// function checkClue(clue) {
//     if (clue.hasOwnProperty("related") && !(clue.related.down.length + clue.related.across.length === 0)) {
//         return false;
//     }
//     return true;
// }

function setFromClues(clueSet, puzzleDate, puzzleDotw, puzzleFill, step = 1) {
    const tempSet = new Set();
    clueSet.forEach((clue) => {
        const key = clue.value;
        // if (!checkClue(clue)) { return; }
        try {
            const answer = puzzleFill.slice(clue.clueStart, clue.clueEnd + 1).filter((_, i) => i % step === 0).join('');
            if (answer.includes(',')) { return; }
            const puzzleDict = {
                clue: key,
                answer: answer,
                date: puzzleDate,
                dotw: parseInt(puzzleDotw, 10),
            };
            tempSet.add(JSON.stringify(puzzleDict));
        } catch (error) {
            console.error('Error processing clue:', error);
        }
    });
    return tempSet;
}

exports.updateDatabase = onRequest(async (req, res) => {
    try {
        const puzzleId = await getRecentPuzzleID();
        const cookie = process.env.NYT_COOKIE;

        const puzzleResp = await axios.get(`https://www.nytimes.com/svc/crosswords/v2/puzzle/${puzzleId}.json`, {
            headers: { Cookie: `NYT-S=${cookie}` }
        });

        const puzzleData = puzzleResp.data.results[0];
        const puzzleWidth = puzzleData.puzzle_meta.width;
        const puzzleDotw = puzzleData.puzzle_meta.printDotw;
        const puzzleDate = puzzleData.print_date;
        const acrossClues = puzzleData.puzzle_data.clues.A;
        const downClues = puzzleData.puzzle_data.clues.D;
        const puzzleFill = puzzleData.puzzle_data.answers;

        const acrossSet = setFromClues(acrossClues, puzzleDate, puzzleDotw, puzzleFill);
        const downSet = setFromClues(downClues, puzzleDate, puzzleDotw, puzzleFill, puzzleWidth);

        const answerSet = new Set([...acrossSet, ...downSet]);

        console.log(answerSet);

        // Insert data into Supabase
        for (const jsonAnswer of answerSet) {
            const answer = JSON.parse(jsonAnswer);
            const { data, error } = await supabase
                .from('daily') // daily_answers
                .upsert([
                    {
                        clue: answer.clue,
                        answer: answer.answer,
                        date: answer.date,
                        dotw: answer.dotw
                    }
                ], { 
                    onConflict: ['clue', 'answer'] // Ensure that duplicate entries are not inserted
                }); 

            if (error) {
                console.error('Error inserting into Supabase:', error);
            }
        }

        console.log("Updated database");
        return res.status(200).send('Database update successfully\n');
    } catch (error) {
        console.error('Error updating the database:', error);
        return res.status(500).send('Failed to update the database\n');
    }
})

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// exports.addMessage = onRequest(async (req, res) => {
//   count += 1;
//   const messageText = req.query.text;
//   const writeResult = await admin.firestore().collection('messages').add({original: messageText, count: count});
//   logger.info('Message added to Firestore', { structuredData: true})
//   res.json({ result: `Message with ID: ${writeResult.id} added.`})
// })
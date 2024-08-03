import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Quiz.css"

function Quiz() {

    const [clue, setClue] = useState(null);
    const [answerLength, setAnswerLength] = useState(null);

    const [inputAnswer, setInputAnswer] = useState("");

    const [answerResponse, setAnswerResponse] = useState(null)

    const location = useLocation();

    useEffect(() => {
        if (!clue) {
            fetchClue();
        }
    }, [location.search]);

    async function fetchClue() {
        await fetch(`/random-clue`)
        .then(response => {
            return response.text().then(row => ({ok: response.ok, status: response.status, row}))
        })
        .then(response => {
            try {
                response.row = JSON.parse(response.row)
            } catch (err) {

            }

            console.log(response)

            if (!response.ok) {
                // setError(<p style={{ color: "red" }}>{response.clue}</p>)
                // setResult(null)
                // setServerError(null)
            } else {
                setClue(response.row.clue)
                setAnswerLength(response.row.answer.length)
                // let out = []
                // response.clue.forEach(set => {
                //     out.push(<p key={out.length}>{set.clue}</p>)
                // });
                // setResult(null)
                setAnswerResponse(null)
                setInputAnswer("")
                // setServerError(null)
            }
        })
        .catch(() => {
            // setServerError(<p style={{ color: "red" }}>Couldn't connect to server</p>)
            // setError(null)
        })
    }

    async function handleAnswerSearch() {
        if (inputAnswer.length !== answerLength) {
            setAnswerResponse(<p style={{ color: "red" }}>Wrong answer length!</p>)
            return;
        }
        
        let searchString = `/check-answer/?clue=${encodeURIComponent(clue)}&answer=${encodeURIComponent(inputAnswer.toUpperCase())}&answerLength=${encodeURIComponent(answerLength)}`
        
        await fetch(searchString)
        .then(response => {
            console.log(response)
            if (response.status === 200) {
                setAnswerResponse(<p style={{ color: "green" }}>Correct!</p>)
            } else {
                setAnswerResponse(<p style={{ color: "red" }}>Incorrect!</p>)
            }
        })
    }


    function handleAnswerKeyDown(event) {
        if (event.key === "Enter" && inputAnswer) {handleAnswerSearch()}
    }

    return (
        <>
            <h1>Quiz</h1>

            <button onClick={fetchClue}>New Clue</button>
            <br></br>

            <div className="container">
                <p>Clue: {clue}</p>
                <p>Answer length: {answerLength}</p>
                <br></br>
                <input type='text' placeholder='Answer' value={inputAnswer} onChange={(e) => {setInputAnswer(e.target.value.replace(/\s+/g,'').toUpperCase()); setAnswerResponse(null)}} onKeyDown={handleAnswerKeyDown}></input>
                <button onClick={handleAnswerSearch}>Submit Answer</button>
            </div>

            {answerResponse && (<div>{answerResponse}</div>)}
        </>
    )

}

export default Quiz;
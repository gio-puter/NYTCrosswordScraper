import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SearchResults.css"

function SearchResults() {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [serverError, setServerError] = useState(null)

    const [inputClue, setInputClue] = useState("");
    const [inputAnswerLength, setInputAnswerLength] = useState("");
    const [inputAnswer, setInputAnswer] = useState("");

    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const clue = queryParams.get("clue")
    const answer = queryParams.get("answer")
    const answerLength = queryParams.get("answerLength")

    useEffect(() => {
        if (clue) {
            fetchAnswers();
        }
        if (answer) {
            fetchClues();
        }
    }, [location.search])

    async function fetchAnswers() {
        await fetch(`/get-answers?clue=${encodeURIComponent(clue)}&answerLength=${encodeURIComponent(answerLength)}`)
        .then(response => {
            return response.text().then(answers => ({ok: response.ok, status: response.status, answers}))
        })
        .then(response => {
            try {
                response.answers = JSON.parse(response.answers)
            } catch (err) {

            }

            console.log(response)

            if (!response.ok) {
                setError(<p style={{ color: "red" }}>{response.answers}</p>)
                setResult(null)
                setServerError(null)
            } else {
                let out = []
                response.answers.forEach(set => {
                    out.push(<p key={out.length}>{set.answer}</p>)
                });
                setResult(out)
                setError(null)
                setServerError(null)
            }
        })
        .catch(() => {
            setServerError(<p style={{ color: "red" }}>Couldn't connect to server</p>)
            setError(null)
        })
    }

    async function fetchClues() {
        await fetch(`/get-clues?answer=${encodeURIComponent(answer)}`)
        .then(response => {
            return response.text().then(clues => ({ok: response.ok, status: response.status, clues}))
        })
        .then(response => {
            try {
                response.clues = JSON.parse(response.clues)
            } catch (err) {

            }

            console.log(response)

            if (!response.ok) {
                setError(<p style={{ color: "red" }}>{response.clues}</p>)
                setResult(null)
                setServerError(null)
            } else {
                let out = []
                response.clues.forEach(set => {
                    out.push(<p key={out.length}>{set.clue}</p>)
                });
                setResult(out)
                setError(null)
                setServerError(null)
            }
        })
        .catch(() => {
            setServerError(<p style={{ color: "red" }}>Couldn't connect to server</p>)
            setError(null)
        })
    }

    function handleClueSearch() {
        let searchString = `/search/?clue=${encodeURIComponent(inputClue)}`
        if (inputAnswerLength) {
            searchString += `&answerLength=${encodeURIComponent(inputAnswerLength)}`
        }
        navigate(searchString);
    }

    function handleAnswerSearch() {
        if (!inputAnswer.replace(/\s+/g,'')) {return}
        
        let searchString = `/search/?answer=${encodeURIComponent(inputAnswer.replace(/\s+/g,'').toUpperCase())}`
        navigate(searchString);
    }

    function handleClueKeyDown(event) {
        if (event.key === "Enter" && inputClue) {handleClueSearch()}
    }

    function handleAnswerKeyDown(event) {
        if (event.key === "Enter" && inputAnswer) {handleAnswerSearch()}
    }

    return (
        <>
            <h1>Search Results</h1>

            <div className="container">
                <div className="search-section">
                    <input type='text' placeholder='Clue' value={inputClue} onChange={(e) => setInputClue(e.target.value)} onKeyDown={handleClueKeyDown}></input>
                    <input type='text' placeholder='Answer Length' value={inputAnswerLength} onChange={(e) => setInputAnswerLength(e.target.value)} onKeyDown={handleClueKeyDown}></input>
                    <button onClick={handleClueSearch}>Search Clue</button>
                </div>

                <div className="search-section">
                    <input type='text' placeholder='Answer' value={inputAnswer} onChange={(e) => setInputAnswer(e.target.value)} onKeyDown={handleAnswerKeyDown}></input>
                    <button onClick={handleAnswerSearch}>Search Answer</button>
                </div>
            </div>

            {error && (<div>{error}</div>)}
            {serverError && (<div>{serverError}</div>)}

            {clue && (<div><p>Showing answer(s) to: {clue}</p></div>)}
            {answer && (<div><p>Showing clue(s) for: {answer}</p></div>)}
            {result && (<div>{result}</div>)}

        </>
    );

}

export default SearchResults
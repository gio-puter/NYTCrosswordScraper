import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SearchResults.css"
import supabase from "../supabase";

function SearchResults() {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

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
        const {data, error} = await supabase.rpc('fetch_answers', {word : clue, answer_length: answerLength})

        if (error) {
            // console.error('Error fetching data', error)
            switch (error.code) {
                case '22P02':
                    setError(<p style={{ color: "red" }}>INVALID PARAMETERS</p>)
                    break;
                case '08003':
                    setError(<p style={{ color: "red" }}>DATABASE CONNECTION ERROR. TRY AGAIN LATER</p>)
                    break;
                default:
                    setError(<p style={{ color: "red" }}>UNEXPECTED ERROR. TRY A DIFFERENT INPUT</p>)
                    break;
            }

            setResult(null);
        } else {
            // console.log('Data: ', data)

            if (data.length === 0) {
                setError(<p style={{ color: "red" }}>NO ANSWERS FOUND FOR: {clue}</p>)
                setResult(null)
                return data;
            }

            let out = []
            data.forEach(row => {
                out.push(<p key={out.length}>{row.answer}</p>)
            })

            // console.log(out)
            setResult(out)
            setError(null)
            return data
        }
    }

    async function fetchClues() {
        const {data, error} = await supabase.rpc('fetch_clues', {word: answer})
        
        if (error) {
            // console.error('Error fetching data', error)
            switch (error.code) {
                case '22P02':
                    setError(<p style={{ color: "red" }}>INVALID PARAMETERS</p>)
                    break;
                case '08003':
                    setError(<p style={{ color: "red" }}>DATABASE CONNECTION ERROR. TRY AGAIN LATER</p>)
                    break;
                default:
                    setError(<p style={{ color: "red" }}>UNEXPECTED ERROR. TRY A DIFFERENT INPUT</p>)
                    break;
            }

            setResult(null);

        } else {
            // console.log('Data: ', data)

            if (data.length === 0) {
                setError(<p style={{ color: "red" }}>NO CLUES FOUND FOR: {answer}</p>)
                setResult(null)
                return data;
            }

            let out = []
            data.forEach(row => {
                out.push(<p key={out.length}>{row.clue}</p>)
            })

            setResult(out)
            setError(null)
            return data
        }
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

            {clue && !error && (<div><p>Showing answer(s) to: {clue}</p></div>)}
            {answer && !error && (<div><p>Showing clue(s) for: {answer}</p></div>)}
            {result && !error && (<div>{result}</div>)}

        </>
    );

}

export default SearchResults
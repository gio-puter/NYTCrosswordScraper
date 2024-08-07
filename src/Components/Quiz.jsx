import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Quiz.css"
import supabase from "../supabase";

function Quiz() {

    const [clue, setClue] = useState(null);
    const [answerLength, setAnswerLength] = useState(null);
    const [answer, setAnswer] = useState(null);

    const [inputAnswer, setInputAnswer] = useState("");

    const [answerResponse, setAnswerResponse] = useState(null)

    const location = useLocation();

    useEffect(() => {
        if (!clue) {
            fetchClue();
        }
    }, [location.search]);

    async function fetchClue() {
        const {data, error} = await supabase.rpc('fetch_random');

        if (error) {
            // console.error('Error fetching data', error);
        } else {
            // console.log('Data: ', data[0]);
            setClue(data[0].clue);
            setAnswer(data[0].answer)
            setAnswerLength(data[0].answer.length);
            setInputAnswer('');
            return data;
        }
    }

    async function handleAnswerSearch() {
        if (inputAnswer === answer) {
            setAnswerResponse(<p style={{ color: "green" }}>Correct!</p>)
            return
        }

        if (inputAnswer.length !== answerLength) {
            setAnswerResponse(<p style={{ color: "red" }}>Wrong answer length!</p>)
            return;
        }

        const {data, error} = await supabase.rpc('check_answer', {clue: clue, answer: inputAnswer.toUpperCase()})

        if (error) {
            // console.error('Error fetching data', error);
        } else {
            // console.log(data)
            if (data) {
                setAnswerResponse(<p style={{ color: "green" }}>Correct!</p>)
            } else {
                setAnswerResponse(<p style={{ color: "red" }}>Incorrect!</p>)
            }
            return data;
        }
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
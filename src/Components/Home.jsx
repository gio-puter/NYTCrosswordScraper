import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {

    const [clue, setClue] = useState("")
    // const [error, setError] = useState(null)
    // const [result, setResult] = useState(null)

    const navigate = useNavigate()

    function handleSearch() {
        navigate(`/search/?clue=${encodeURIComponent(clue)}`);
    }

    function handleKeyDown(event) {
        if (event.key === "Enter" && clue) {handleSearch()}
    }

    return (
        <>
            <h1>Home Page</h1>
            <input type='text' placeholder='Clue' value={clue} onChange={(e) => setClue(e.target.value)} onKeyDown={handleKeyDown}></input>
            <button onClick={handleSearch}>Search</button>
        </>
    )

}

export default Home;
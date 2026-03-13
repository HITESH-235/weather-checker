// https://api.openweathermap.org/data/2.5/weather?q={city name}&units={unit_type}&appid={API key}
import {useState, useEffect} from "react";
import "./App.css";

function App() {  
    const [city, setCity] = useState(""); // empty / city name
    const [weather, setWeather] = useState(null); // null/data from api for the city
    const [loading, setLoading] = useState(false); // false/true
    const [error, setError] = useState(null); // null/error msg
    const [unit, setUnit] = useState("metric"); // metric(C)/imperial(F)
    
    const [recentCities, setRecentCities] = useState([]);
    useEffect(() => {
        const storedCities = localStorage.getItem("recentCities");
        if (storedCities) {
            setRecentCities(JSON.parse(storedCities))
        }
    }, [])
    
    const toggleUnit = () => {
        const newUnit = (unit === "metric") ? "imperial":"metric";
        setUnit(newUnit)

        if (city) {
            fetchWeather(newUnit);
        }
    }
    
    const fetchWeather = async(currUnit = unit, cityName = city) => {
        if (!cityName.trim()) return; // returns if city text field is emtpy
        try {
            setLoading(true); 
            setError(null); 
    
            // const API_KEY = "1c2a762d2bc26b261524bb2dc09ad90c";
            const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;;
            const res = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=${currUnit}&appid=${API_KEY}`
            )
    
            if (!res.ok) {
                throw new Error("City Not Found");
            }
    
            const data = await res.json();
            setWeather(data);

            const curCity = data.name;
            let filteredList = recentCities.filter((c) => c !== curCity);
            let updatedList = [curCity].concat(filteredList);

            if (updatedList.length > 5) {
                updatedList = updatedList.slice(0,5);
            }

            setRecentCities(updatedList);
            localStorage.setItem("recentCities", JSON.stringify(updatedList));
        }
        catch(err) {
            setError(err.message);
            setWeather(null);
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <>
        <nav className="site-navbar">
            <div className="nav-container">

                <div className="nav-logo">
                    DevTools
                </div>

                <div className="nav-links">
                    <a href="https://github.com/HITESH-235">Home</a>
                    <a href="https://github.com/HITESH-235">Github</a>
                    <a href="https://www.linkedin.com/in/hitesh235/">Linkedin</a>
                    <a href="mailto:codonstream.72@gmail.com">Mail</a>
                </div>

            </div>
        </nav>
        <div className="app-container">
            <div className="weather-app">

                <header className="app-header">
                    <h1 className="app-title">Weather Checker</h1>
                </header>

                <div className="search-section">
                    <div className="search-bar">
                        <input
                            className="city-input"
                            type="text"
                            placeholder="Enter City:"
                            value={city}
                            onChange={(e) => {
                                setCity(e.target.value);
                                setError(null);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    fetchWeather(unit, city);
                                }
                            }}
                        />

                        <button
                            className="search-button"
                            onClick={() => fetchWeather(unit, city)}
                        >
                            Search
                        </button>
                    </div>
                </div>

                {recentCities.length > 0 &&
                    <div className="recent-section">
                        <h3 className="recent-title">Recent Searches</h3>

                        <div className="recent-list">
                            {recentCities.map((c, index) => (
                                <button
                                    className="recent-city-btn"
                                    key={index}
                                    onClick={() => {
                                        setCity(c);
                                        fetchWeather(unit, c);
                                    }}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                }

                <div className="unit-toggle-section">
                    <button
                        className="unit-toggle-btn"
                        onClick={toggleUnit}
                    >
                        switch to {unit === "metric" ? "°F" : "°C"}
                    </button>
                </div>

                <div className="status-section">
                    {loading && <p className="loading-text">Loading...</p>}
                    {error && <p className="error-text">{error}</p>}
                </div>

                {weather &&
                    <div className="weather-card">
                        <h2 className="city-name">{weather.name}</h2>

                        <div className="weather-icon-container">
                            <img
                                className="weather-icon"
                                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                                alt="weather icon"
                            />
                        </div>

                        <div className="weather-details">
                            <p className="temperature">
                                Temperature: {weather.main.temp} {unit === "metric" ? "°C" : "°F"}
                            </p>
                            <p className="humidity">
                                Humidity: {weather.main.humidity}%
                            </p>
                            <p className="condition">
                                Condition: {weather.weather[0].main}
                            </p>
                        </div>
                    </div>
                }

            </div>
        </div>
        </>
    );
}

export default App;
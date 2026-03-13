// https://api.openweathermap.org/data/2.5/weather?q=London&units=metric&appid=${API key}

// "coord":{"lon":-0.1257,"lat":51.5085},
// "weather":[{"id":804,"main":"Clouds","description":"overcast clouds","icon":  *"04n"*  }],
// "base":"stations",
// "main":{  *"temp":6.21*   ,"feels_like":2.28,"temp_min":6.21,"temp_max":6.21,"pressure":1001,  *"humidity":80*  ,"sea_level":1001,"grnd_level":997},
// "visibility":10000,
// "wind":{"speed":6.39,"deg":253,"gust":14.88},
// "clouds":{"all":100},"dt":1773380740,
// "sys":{"country":"GB","sunrise":1773382779,"sunset":1773424834},
// "timezone":0,"id":2643743,"name":  *"London"*  ,"cod":200}

import {useState, useEffect} from "react";
import "./App.css";

function App() {  
    const [city, setCity] = useState(""); // empty / city name
    const [weather, setWeather] = useState(null); // null/data from api for the city
    const [loading, setLoading] = useState(false); // false/true
    const [error, setError] = useState(null); // null/error msg
    const [unit, setUnit] = useState("metric"); // metric(C)/imperial(F)
    
    const [recentCities, setRecentCities] = useState([]); // list of last 5 searched cities
    useEffect(() => { // saving the last 5 searches thr useEff in lS
        const storedCities = localStorage.getItem("recentCities");
        if (storedCities) {
            setRecentCities(JSON.parse(storedCities))
        }
    }, []) // saved once only 
    
    const toggleUnit = () => { // changes thr setUnit() and updates weather card thr fetchWeather
        const newUnit = (unit === "metric") ? "imperial":"metric"; // avoid direct updation
        setUnit(newUnit)

        if (city) {
            fetchWeather(newUnit);
        }
    }
    
    const fetchWeather = async(currUnit = unit, cityName = city) => {
        if (!cityName.trim()) return; // returns if city text field is empty
        try {
            setLoading(true); 
            setError(null); 
    
            // environment variable (preferred over hardcoded key):
            const API_KEY = import.meta.env.VITE_WEATHER_API_KEY; // dont use the key directly, security reason

            const res = await fetch( // response object
                `https://api.openweathermap.org/data/2.5/weather?q=${cityName.trim()}&units=${currUnit}&appid=${API_KEY}`
            )
    
            if (res.status < 200 || res.status >= 300) { // if result has an unsuccessful response
                throw new Error("City Not Found"); // this part goes into the catch block
            }


    
            const data = await res.json(); // converts the response to js object
            setWeather(data);

            const curCity = data.name;
            let filteredList = recentCities.filter((c) => c !== curCity); // remove curr searched city to put on top
            let updatedList = [curCity].concat(filteredList);

            if (updatedList.length > 5) { // restrict storing more than 5 searches
                updatedList = updatedList.slice(0,5);
            }

            setRecentCities(updatedList);
            localStorage.setItem("recentCities", JSON.stringify(updatedList));
        }
        catch(err) {
            setError(err.message);
            setWeather(null); // no card displayed on error
        }
        finally {
            setLoading(false); // loading disappears after process (regardless of outcome)
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
                    <a href="https://hitesh-235.github.io/index.html">Home</a>
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
                            onKeyDown={(e) => { // enter has same action as search button
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
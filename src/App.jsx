import { useState, useEffect } from 'react'
import './App.css'
import weatherLogo from './assets/weather-logo.svg'

function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [userLocation, setUserLocation] = useState(null)

  const API_KEY = '9109b2b18bc2cf80e14660dd42ddf108'

  // Get weather condition class
  const getWeatherClass = (weatherCode) => {
    if (!weatherCode) return 'default'
    
    const code = weatherCode.toLowerCase()
    if (code.includes('clear')) return 'sunny'
    if (code.includes('cloud')) return 'cloudy'
    if (code.includes('rain') || code.includes('drizzle')) return 'rainy'
    if (code.includes('snow')) return 'snowy'
    if (code.includes('thunder')) return 'stormy'
    if (code.includes('mist') || code.includes('fog')) return 'foggy'
    return 'default'
  }

  // Get user's location when component mounts
  useEffect(() => {
    getUserLocation()
  }, [])

  // Get weather data when user location is available
  useEffect(() => {
    if (userLocation) {
      fetchWeatherByCoords(userLocation.lat, userLocation.lon)
    }
  }, [userLocation])

  const getUserLocation = () => {
    setLoading(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        // Success callback
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
          setError('')
        },
        // Error callback
        (error) => {
          setError('Unable to get location: ' + error.message)
          setLoading(false)
        }
      )
    } else {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
    }
  }

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      )
      const data = await response.json()
      
      if (response.ok) {
        setWeather(data)
        setError('')
      } else {
        setError('Failed to fetch weather data')
      }
    } catch (err) {
      setError('Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }

  const fetchWeatherByCity = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      )
      const data = await response.json()
      
      if (response.ok) {
        setWeather(data)
        setError('')
      } else {
        setError('City not found')
        setWeather(null)
      }
    } catch (err) {
      setError('Failed to fetch weather data')
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }

  const getBackgroundImage = (weatherCode) => {
    if (!weatherCode) return '';
    
    const code = weatherCode.toLowerCase();
    const images = {
      'clear sky': 'https://cdn.pixabay.com/photo/2022/04/28/04/12/sun-7161716_1280.jpg',
      'few clouds': 'https://cdn.pixabay.com/photo/2022/03/28/10/06/mountain-7097104_1280.jpg',
      'scattered clouds': 'https://cdn.pixabay.com/photo/2017/06/06/07/10/sky-2376425_1280.jpg',
      'broken clouds': 'https://cdn.pixabay.com/photo/2022/08/08/13/59/cloud-of-bunch-7372799_1280.jpg',
      'shower rain': 'https://cdn.pixabay.com/photo/2018/07/15/15/28/rain-3539833_1280.jpg',
      'rain': 'https://cdn.pixabay.com/photo/2022/07/28/06/07/thunderstorm-7349206_1280.jpg',
      'thunderstorm': 'https://cdn.pixabay.com/photo/2020/04/13/16/39/flash-5039182_1280.jpg',
      'snow': 'https://cdn.pixabay.com/photo/2019/10/07/11/26/winter-landscape-4532412_1280.jpg',
      'mist': 'https://cdn.pixabay.com/photo/2014/12/17/18/40/fog-571786_1280.jpg'
    };
    
    return images[code] || images['clear sky'];
  }

  return (
    <div 
      className={`app-container ${weather ? getWeatherClass(weather.weather[0].main) : 'default'}`}
      style={{
        backgroundImage: weather ? `url(${getBackgroundImage(weather.weather[0].description)})` : 'none'
      }}
    >
      <div className="weather-animation-container">
        <div className="weather-elements"></div>
      </div>
      <div className="weather-container">
        <div className="app-header">
          <img src={weatherLogo} alt="WeatherScope Logo" className="app-logo" />
          <h1>WeatherScope</h1>
        </div>
        
        <div className="location-controls">
          <button onClick={getUserLocation} className="location-btn">
            📍 Use My Location
          </button>
          
          <form onSubmit={fetchWeatherByCity}>
            <input
              type="text"
              placeholder="Or enter city name"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button type="submit">Get Weather</button>
          </form>
        </div>

        {loading && <p className="loading">Loading weather data...</p>}
        {error && <p className="error">{error}</p>}
        
        {weather && (
          <div className="weather-info">
            <h2>{weather.name}, {weather.sys.country}</h2>
            <div className="weather-details">
              <img 
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
              />
              <p className="temperature">{Math.round(weather.main.temp)}°C</p>
              <p className="description">{weather.weather[0].description}</p>
            </div>
            <div className="additional-info">
              <p>Humidity: {weather.main.humidity}%</p>
              <p>Wind Speed: {weather.wind.speed} m/s</p>
              <p>Feels like: {Math.round(weather.main.feels_like)}°C</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

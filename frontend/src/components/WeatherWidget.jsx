export default function WeatherWidget({ weather, error }) {
  if (error) {
    return (
      <div className="card bg-base-100 shadow-sm rounded-3xl p-4 text-center text-base-content/30 text-sm">
        clima não configurado
      </div>
    )
  }

  if (!weather) {
    return (
      <div className="card bg-base-100 shadow-sm rounded-3xl p-5">
        <div className="flex items-center gap-4">
          <div className="skeleton w-16 h-16 rounded-2xl shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="skeleton h-8 w-24 rounded-xl" />
            <div className="skeleton h-4 w-32 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-base-100 shadow-sm rounded-3xl p-5">
      <div className="flex items-center gap-3">
        <img
          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
          alt={weather.description}
          className="w-16 h-16"
        />
        <div className="flex-1">
          <p className="text-3xl font-bold text-base-content leading-none">{weather.temp}°C</p>
          <p className="text-base-content/50 capitalize text-sm mt-1">{weather.description}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-base-content text-sm">{weather.city}</p>
          <p className="text-xs text-base-content/40">sensação {weather.feels_like}°C</p>
          <p className="text-xs text-base-content/40">umidade {weather.humidity}%</p>
        </div>
      </div>
    </div>
  )
}

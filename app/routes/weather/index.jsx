import axios from "axios";
import { useLoaderData, redirect } from "remix";

export async function loader({ request }) {
  try {
    const url = new URL(request.url);
    const search = new URLSearchParams(url.search);
    if (!search.get("city")) return redirect("/");
    const city = search.get("city");
    const res = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&lang=ua&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );

    const weather = res.data.weather[0];
    const rain = res.data.rain ? res.data.rain["1h"] || 0 : 0; // Дощ за останню годину
    const snow = res.data.snow ? res.data.snow["1h"] || 0 : 0; // Сніг за останню годину

    return {
      city,
      type: weather.main,
      description: weather.description,
      temp: res.data.main.temp,
      rain,
      snow,
    };
  } catch (err) {
    console.error(err);
    return redirect("/");
  }
}

export default function Index() {
  const data = useLoaderData();

  const getWeatherStyle = () => {
    if (data.type === "Clear") {
      return {
        background: "",
        color: "#333",
      };
    }
    if (data.type === "Clouds") {
      return {
        background: "linear-gradient(to top, #bdc3c7, #2c3e50)",
        color: "#fff",
      };
    }
    if (data.rain > 0) {
      return {
        background: "",
        color: "#fff",
      };
    }
    if (data.snow > 0) {
      return {
        background: "",
        color: "#000",
      };
    }
    return {
      background: "#e0e0e0",
      color: "#000",
    };
  };

  const weatherStyle = getWeatherStyle();

  return (
    <div
      style={{
        ...weatherStyle,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        margin: 0,
        padding: 0,
        fontFamily: "Arial, sans-serif",
        transition: "background 0.5s ease-in-out",
      }}
    >
      <h1>{data.city}</h1>
      <h2>{data.type}</h2>
      <h3>Температура: {data.temp} °C</h3>
      {data.rain > 0 && <h3>Дощ: {data.rain} мм/год</h3>}
      {data.snow > 0 && <h3>Сніг: {data.snow} мм/год</h3>}
    </div>
  );
}

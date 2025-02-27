import { useState } from "react";
import axios from "axios";
import config from "../config/config";


export default function DownloadPage() {
  const [code, setCode] = useState("");
  const [downloadLink, setDownloadLink] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setDownloadLink(null);

    try {
        const apiUrl = config().downloadApk;
        const response = await axios.get(apiUrl, {
            params: { code },
      }).then();
      setDownloadLink(response.data.download_url);
      console.log(downloadLink)
    } catch (err) {
      setError("Неверный код. Пожалуйста, попробуйте еще раз !");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Скачать Файл</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Введите код"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          style={{ padding: "8px", marginRight: "10px" }}
        />
        <button type="submit" style={{ padding: "8px 15px", cursor: "pointer" }}>
          Проверка
        </button>
      </form>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

      {downloadLink && (
        <div style={{ marginTop: "20px", marginBottom: "20px"}}>
          <h3>Код действителен ! НАЖМИТЕ НИЖЕ, чтобы загрузить :</h3>
          <a href={downloadLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: "18px", fontWeight: "bold" }}>
            📥 Скачать Апк файл
          </a>
        </div>
      )}
    </div>
  );
}

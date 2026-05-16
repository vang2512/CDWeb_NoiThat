import { useState } from "react";

const MapIframe = () => {
  const [mapUrl, setMapUrl] = useState(
    "https://www.google.com/maps?q=10.7769,106.7009&z=15&output=embed"
  );

  const openGoogleMaps = () => {
    window.open("https://www.google.com/maps", "_blank");
  };

  const handlePasteLink = () => {
    const url = prompt("Dán link Google Maps vào đây:");

    if (!url) return;

    // extract lat lng từ link
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

    if (match) {
      const lat = match[1];
      const lng = match[2];

      const embedUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

      setMapUrl(embedUrl);

      console.log("Selected:", { lat, lng });
    } else {
      alert("Link không hợp lệ!");
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <iframe
        width="100%"
        height="220"
        style={{ border: 0, borderRadius: "12px" }}
        loading="lazy"
        allowFullScreen
        src={mapUrl}
      ></iframe>

      {/* Button mở Google Map */}
      <button
        onClick={openGoogleMaps}
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 1000,
          background: "#fff",
          padding: "6px 10px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Mở Google Map
      </button>

      {/* Button dán link */}
      <button
        onClick={handlePasteLink}
        style={{
          position: "absolute",
          top: 50,
          left: 10,
          zIndex: 1000,
          background: "#fff",
          padding: "6px 10px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Dán vị trí
      </button>
    </div>
  );
};

export default MapIframe;
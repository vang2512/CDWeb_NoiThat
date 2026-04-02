import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import { LeafletMouseEvent, Icon } from "leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";

// 📍 Marker đẹp
const customIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

type LatLng = {
  lat: number;
  lng: number;
  address?: string;
};

type Props = {
  onSelect?: (data: LatLng) => void;
};

const MapPicker: React.FC<Props> = ({ onSelect }) => {
  const [position, setPosition] = useState<[number, number]>([10.7769, 106.7009]);

  // 🔥 LẤY ĐỊA CHỈ TỪ LAT LNG
  const getAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`
      );
      const data = await res.json();

      return data.display_name; // full địa chỉ
    } catch (err) {
      return "Không lấy được địa chỉ";
    }
  };

  // 📍 Click map
  const LocationMarker = () => {
    useMapEvents({
      async click(e: LeafletMouseEvent) {
        const { lat, lng } = e.latlng;

        setPosition([lat, lng]);

        const address = await getAddress(lat, lng);

        if (onSelect) {
          onSelect({ lat, lng, address });
        }
      },
    });

    return <Marker position={position} icon={customIcon} />;
  };

  // 🔍 Search VN
  const SearchControl = () => {
    const map = useMap();

    useEffect(() => {
      const provider = new OpenStreetMapProvider({
        params: {
          countrycodes: "vn",
          "accept-language": "vi",
          limit: 5
        }
      });

      const searchControl = new (GeoSearchControl as any)({
        provider,
        style: "bar",
        showMarker: false
      });

      map.addControl(searchControl);

      map.on("geosearch/showlocation", async (result: any) => {
        const { x, y } = result.location;

        setPosition([y, x]);

        const address = await getAddress(y, x);

        if (onSelect) {
          onSelect({ lat: y, lng: x, address });
        }

        map.setView([y, x], 16);
      });

      return () => {
        map.removeControl(searchControl);
      };
    }, [map]);

    return null;
  };

  // 📍 Locate user
  const LocateButton = () => {
    const map = useMap();

    const handleLocate = () => {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setPosition([lat, lng]);

        const address = await getAddress(lat, lng);

        if (onSelect) {
          onSelect({ lat, lng, address });
        }

        map.setView([lat, lng], 16);
      });
    };

    return (
      <button
        onClick={handleLocate}
        style={{
          position: "absolute",
          top: 70,
          right: 10,
          zIndex: 1000,
          background: "#fff",
          border: "none",
          padding: "8px 10px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          cursor: "pointer"
        }}
      >
        📍
      </button>
    );
  };

  return (
    <div style={{ position: "relative" }}>
      <MapContainer center={position} zoom={15} style={{ height: "220px", borderRadius: "12px" }}>
        <TileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png" />

        <SearchControl />
        <LocationMarker />
        <LocateButton />
      </MapContainer>
    </div>
  );
};

export default MapPicker;
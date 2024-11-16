import React, { useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, Polygon } from "react-leaflet";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";

function App() {
  const [showArc, setShowArc] = useState(false);
  const [showCircle, setShowCircle] = useState(false);
  const [showBuffer, setShowBuffer] = useState(false);
  const [showVOR, setShowVOR] = useState(false);
  const [showTIN, setShowTIN] = useState(true);

  const center = turf.point([-75, 40]);
  const radius = 5;
  const bearing1 = 25;
  const bearing2 = 47;
  const options = {
    bbox: [30, 50, 50, 70],
  };

  // Generate random points for Voronoi
  const points = turf.randomPoint(50, { bbox: [30, 50, 50, 70] });
  points.features.forEach((feature) => {
    feature.properties.z = Math.floor(Math.random() * 10); // Random value between 0-9
  });
  // Arc coordinates
  const arc = turf.lineArc(center, radius, bearing1, bearing2);
  const arcCoordinates = arc.geometry.coordinates.map((coord) => [coord[1], coord[0]]);

  // Circle coordinates
  const circle = turf.circle(center, radius, { units: "kilometers" });
  const circleCoordinates = circle.geometry.coordinates[0].map((coord) => [coord[1], coord[0]]);

  // Buffer coordinates
  const buffer = turf.buffer(center, 10, { units: "kilometers" });
  const bufferCoordinates = buffer.geometry.coordinates[0].map((coord) => [coord[1], coord[0]]);

   // Generate TIN
   const tin = turf.tin(points, "z");

   // Extract TIN polygons
   const tinPolygons = tin.features.map((triangle) =>
     triangle.geometry.coordinates[0].map((coord) => [coord[1], coord[0]])
   );
  
  // Generate Voronoi polygons
  const voronoi = turf.voronoi(points, options);
  const voronoiPolygons = voronoi.features.map((polygon) =>
    polygon.geometry.coordinates[0].map((coord) => [coord[1], coord[0]])
  );

  // Extract points for rendering markers
  const pointCoordinates = points.features.map((feature) => [
    feature.geometry.coordinates[1],
    feature.geometry.coordinates[0],
  ]);

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <div style={{ width: "200px", padding: "20px", backgroundColor: "black" }}>
        <h3>Turf.js Map Controls</h3>
        <label>
          <input
            type="checkbox"
            checked={showArc}
            onChange={(e) => setShowArc(e.target.checked)}
          />
          Show Arc
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={showCircle}
            onChange={(e) => setShowCircle(e.target.checked)}
          />
          Show Circle
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={showBuffer}
            onChange={(e) => setShowBuffer(e.target.checked)}
          />
          Show Buffer
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={showVOR}
            onChange={(e) => setShowVOR(e.target.checked)}
          />
          Show Voronoi
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={showTIN}
            onChange={(e) => setShowTIN(e.target.checked)}
          />
          Show Tin
        </label>
      </div>

      {/* Map Container */}
      <div style={{ width: "90%", height: "850px", margin: "20px" }}>
        <MapContainer center={[40, -75]} zoom={4} style={{ width: "100%", height: "100%" }}>
          {/* OpenStreetMap tiles */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Display the arc if checked */}
          {showArc && <Polyline positions={arcCoordinates} color="blue" />}

          {/* Display the circle if checked */}
          {showCircle && <Polyline positions={circleCoordinates} color="green" />}

          {/* Display the buffer if checked */}
          {showBuffer && <Polyline positions={bufferCoordinates} color="black" />}

          {/* Render TIN polygons */}
          {showTIN &&
            tinPolygons.map((polygon, index) => (
              <Polygon key={index} positions={polygon} color="blue">
                <Popup>
                  {`z: ${tin.features[index].properties.a}, ${tin.features[index].properties.b}, ${tin.features[index].properties.c}`}
                </Popup>
              </Polygon>
            ))}

          {/* Render points */}
          {points.features.map((point, index) => (
            <Marker
              key={index}
              position={[point.geometry.coordinates[1], point.geometry.coordinates[0]]}
            >
              <Popup>{`z: ${point.properties.z}`}</Popup>
            </Marker>
          ))}

          {/* Display Voronoi polygons */}
          {showVOR &&
            voronoiPolygons.map((polygon, index) => (
              <Polygon key={index} positions={polygon} color="red">
                <Popup>Polygon {index + 1}</Popup>
              </Polygon>
            ))}

          {/* Display points as markers */}
          {showVOR &&
            pointCoordinates.map((coord, index) => (
              <Marker key={index} position={coord}>
                <Popup>{`Point ${index + 1}: ${coord[0].toFixed(2)}, ${coord[1].toFixed(2)}`}</Popup>
              </Marker>
            ))}

          {/* Display center point */}
          <Marker position={[40, -75]}>
            <Popup>Center Point</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}

export default App;

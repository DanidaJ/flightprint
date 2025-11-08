import { useEffect, useRef, useState, memo } from 'react';
import Globe from 'react-globe.gl';

const Globe3D = memo(() => {
  const globeEl = useRef();
  const containerRef = useRef();
  const [arcs, setArcs] = useState([]);
  const [points, setPoints] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    // Set dimensions based on container
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = containerRef.current.offsetHeight;
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    
    // Debounced resize handler
    let resizeTimeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateDimensions, 250);
    };
    
    window.addEventListener('resize', debouncedResize, { passive: true });

    // Major airports with coordinates
    const airports = [
      { name: 'JFK', lat: 40.6413, lng: -73.7781, city: 'New York' },
      { name: 'LHR', lat: 51.4700, lng: -0.4543, city: 'London' },
      { name: 'CDG', lat: 49.0097, lng: 2.5479, city: 'Paris' },
      { name: 'NRT', lat: 35.7720, lng: 140.3929, city: 'Tokyo' },
      { name: 'DXB', lat: 25.2532, lng: 55.3657, city: 'Dubai' },
      { name: 'SIN', lat: 1.3644, lng: 103.9915, city: 'Singapore' },
      { name: 'LAX', lat: 33.9416, lng: -118.4085, city: 'Los Angeles' },
      { name: 'SYD', lat: -33.9461, lng: 151.1772, city: 'Sydney' },
      { name: 'HKG', lat: 22.3080, lng: 113.9185, city: 'Hong Kong' },
      { name: 'FRA', lat: 50.0379, lng: 8.5622, city: 'Frankfurt' },
    ];

    // Create flight paths between major routes
    const flightRoutes = [
      { start: airports[0], end: airports[1], color: '#10b981' }, // JFK - LHR
      { start: airports[1], end: airports[2], color: '#06b6d4' }, // LHR - CDG
      { start: airports[2], end: airports[3], color: '#10b981' }, // CDG - NRT
      { start: airports[4], end: airports[5], color: '#06b6d4' }, // DXB - SIN
      { start: airports[6], end: airports[3], color: '#10b981' }, // LAX - NRT
      { start: airports[0], end: airports[6], color: '#06b6d4' }, // JFK - LAX
      { start: airports[1], end: airports[4], color: '#10b981' }, // LHR - DXB
      { start: airports[5], end: airports[7], color: '#06b6d4' }, // SIN - SYD
      { start: airports[3], end: airports[8], color: '#10b981' }, // NRT - HKG
      { start: airports[2], end: airports[9], color: '#06b6d4' }, // CDG - FRA
    ];

    // Set arcs data
    setArcs(
      flightRoutes.map((route) => ({
        startLat: route.start.lat,
        startLng: route.start.lng,
        endLat: route.end.lat,
        endLng: route.end.lng,
        color: [route.color, route.color],
        altitude: 0.3,
      }))
    );

    // Set airport markers
    setPoints(
      airports.map((airport) => ({
        lat: airport.lat,
        lng: airport.lng,
        size: 0.15,
        color: '#10b981',
        label: airport.name,
        city: airport.city,
      }))
    );

    // Configure globe after a short delay
    const configTimeout = setTimeout(() => {
      if (globeEl.current) {
        globeEl.current.controls().autoRotate = true;
        globeEl.current.controls().autoRotateSpeed = 0.3; // Reduced from 0.4 for smoother performance
        globeEl.current.controls().enableZoom = false;
        
        // Point camera to show more of the globe
        globeEl.current.pointOfView({ lat: 20, lng: 10, altitude: 2.2 }, 0);
      }
    }, 100);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(configTimeout);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        
        // Flight paths (arcs)
        arcsData={arcs}
        arcColor="color"
        arcDashLength={0.6}
        arcDashGap={0.2}
        arcDashAnimateTime={3000} // Slower animation for better performance
        arcStroke={0.5}
        arcAltitude="altitude"
        arcsTransitionDuration={0}
        rendererConfig={{ antialias: false, powerPreference: 'high-performance' }} // Performance optimization
        
        // Airport markers (points)
        pointsData={points}
        pointColor="color"
        pointAltitude={0.01}
        pointRadius="size"
        pointLabel={(d) => `
          <div style="
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(10px);
            padding: 8px 12px;
            border-radius: 8px;
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: white;
            font-family: 'Poppins', sans-serif;
            font-size: 12px;
            font-weight: 500;
          ">
            <div style="color: #10b981; font-weight: 600; margin-bottom: 2px;">${d.label}</div>
            <div style="color: rgba(255, 255, 255, 0.8); font-size: 11px;">${d.city}</div>
          </div>
        `}
        
        // Atmosphere
        atmosphereColor="#10b981"
        atmosphereAltitude={0.15}
        
        // Styling
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
      />
    </div>
  );
});

Globe3D.displayName = 'Globe3D';

export default Globe3D;

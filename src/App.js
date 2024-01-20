import React, { useEffect, useState } from 'react';

export default function App() {
  const [lines, setLines] = useState([]);
  const [points, setPoints] = useState([]);
  const [isEditMode, setEditMode] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);
  const [dragStartPoint, setDragStartPoint] = useState(null);
  const [selectedLineIndex, setSelectedLineIndex] = useState(null);
  const [isResizeMode, setResizeMode] = useState(false);
  const [isMoveMode, setMoveMode] = useState(false);

  const handleResizeButtonClick = () => {
    setEditMode(true);
    setResizeMode(true);
    setPoints([]);
    setSelectedLine(null);
    setSelectedLineIndex(null);
    setMoveMode(false)
  };
  const handleMoveButtonClick = () => {
    setEditMode(true);
    setResizeMode(false);
    setPoints([]);
    setSelectedLine(null);
    setSelectedLineIndex(null);
    setMoveMode(true)
  };
  const handleListClick = (index) => {
    setSelectedLineIndex(index);
  };

  const handleMouseDown = (event) => {
    const localX = event.clientX - event.currentTarget.getBoundingClientRect().left;
    const localY = event.clientY - event.currentTarget.getBoundingClientRect().top;

    if (!isEditMode) {
      setPoints((prevPoints) => [...prevPoints, { x: localX, y: localY }]);
    } else {
      handleSelectLine(localX, localY);
      setDragStartPoint({ x: localX, y: localY });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (points.length >= 2) {
        const newLine = { points: [...points] };
        setLines((prevLines) => [...prevLines, newLine]);
      }
      setPoints([]);
    }
    setPoints([]);
  };
  const pointToLineDistance = (px, py, x1, y1, x2, y2) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    const param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;

    return Math.sqrt(dx * dx + dy * dy);
  };


  const handleSelectLine = (x, y) => {
    const clickedLine = lines.findIndex((line) => {
      for (let i = 0; i < line.points.length - 1; i++) {
        const x1 = line.points[i].x;
        const y1 = line.points[i].y;
        const x2 = line.points[i + 1].x;
        const y2 = line.points[i + 1].y;

        const distance = pointToLineDistance(x, y, x1, y1, x2, y2);
        if (distance < 5) {
          return true;
        }
      }
      return false;
    });

    if (clickedLine !== -1) {
      setSelectedLine(clickedLine);
      handleListClick(clickedLine)
    }
  };

  // const handleEditButtonClick = () => {
  //   setEditMode(true);
  //   setPoints([]);
  //   setSelectedLine(null);
  //   setSelectedLine(null)
  // };

  const handleDeleteButtonClick = () => {
    if (selectedLine !== null) {
      const updatedLines = [...lines];
      updatedLines.splice(selectedLine, 1);
      setLines(updatedLines);
      setSelectedLine(null);
      setSelectedLineIndex(null)
    }
  };

  const handleDrawButtonClick = () => {
    setEditMode(false);
    setPoints([]);
    setSelectedLine(null)
    handleSelectLine(null)
    handleListClick(null)
    setMoveMode(false)
    setResizeMode(false)
  };
  const handleMouseMove = (event) => {
    if (isEditMode && selectedLine !== null && dragStartPoint) {
      const localX = event.clientX - event.currentTarget.getBoundingClientRect().left;
      const localY = event.clientY - event.currentTarget.getBoundingClientRect().top;

      const updatedLines = [...lines];
      const updatedLine = { ...updatedLines[selectedLine] };
      updatedLine.points = [...updatedLine.points];

      if (isResizeMode) {
        updatedLine.points[updatedLine.points.length - 1] = {
          x: localX,
          y: localY,
        };
      } else {
        const deltaX = localX - dragStartPoint.x;
        const deltaY = localY - dragStartPoint.y;

        for (let i = 0; i < updatedLine.points.length; i++) {
          updatedLine.points[i] = {
            x: updatedLine.points[i].x + deltaX,
            y: updatedLine.points[i].y + deltaY,
          };
        }
      }

      setLines((prevLines) => {
        const newLines = [...prevLines];
        newLines[selectedLine] = updatedLine;
        return newLines;
      });

      setDragStartPoint({ x: localX, y: localY });
    }
  };
  const handleMouseUp = () => {
    setDragStartPoint(null);
  };

  useEffect(() => {
    console.log('Çizgi konumları', lines);
  }, [lines]);

  const drawLines = () => {
    const drawnLines = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const linePoints = line.points;

      if (linePoints.length === 2) {
        // Sadece iki nokta varsa düz çizgi çiz
        drawnLines.push(
          <line
            key={`line${i}`}
            x1={linePoints[0].x}
            y1={linePoints[0].y}
            x2={linePoints[1].x}
            y2={linePoints[1].y}
            stroke={i === selectedLine ? 'red' : 'black'}
            strokeWidth={3}
            markerEnd="url(#arrow)"

          />
        );
        drawnLines.push(
          <circle
            key={`startPoint${i}`}
            cx={linePoints[0].x}
            cy={linePoints[0].y}
            r={3}
            fill="red"
          />
        );
      } else if (linePoints.length >= 3) {
        const pathData = `M ${linePoints[0].x} ${linePoints[0].y} C ${linePoints[1].x} ${linePoints[1].y}, ${linePoints[2].x} ${linePoints[2].y}, ${linePoints.slice(linePoints.length - 1).map(point => `${point.x} ${point.y}`).join(' ')}`;

        drawnLines.push(
          <path
            key={`line${i}`}
            d={pathData}
            fill="transparent"
            stroke={i === selectedLine ? 'red' : 'black'}
            strokeWidth={3}
            markerEnd="url(#arrow)"
          />
        );

      }
      drawnLines.push(
        <circle
          key={`startPoint${i}`}
          cx={linePoints[0].x}
          cy={linePoints[0].y}
          r={3}
          fill="red"
        />
      );


    }
    return drawnLines;
  };
  const handleMouseLeave = () => {
    setDragStartPoint(null);
  };

  return (
    <div style={{ display: 'flex', marginTop: 10, width: '100%' }}>

      <div style={{ display: 'flex', alignItems: 'start', marginRight: 10 }}>
        <button onClick={handleDrawButtonClick}>Çiz</button>
        {/* <button onClick={handleEditButtonClick}>Düzenle</button> */}
        <button onClick={handleResizeButtonClick}>Büyült/Küçült</button>
        <button onClick={handleMoveButtonClick}>Taşı</button>
        {selectedLine !== null ? (<button onClick={handleDeleteButtonClick} >Sil</button>) : (<button onClick={handleDeleteButtonClick} disabled>Sil</button>)}
      </div>

      <div
        style={{
          height: '100%',
          display: 'flex',
        }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <svg
          style={{
            border: '1px solid gray',
            textAlign: 'center',
            alignSelf: 'center',
            display: 'inline-block',
            cursor: isMoveMode ? 'all-scroll' : isResizeMode ? 'ne-resize' : 'crosshair',

          }}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          width="1000"
          height="600"
        >
          <defs>
            <marker
              id="arrow"
              markerWidth="10"
              markerHeight="10"
              refX="5"
              refY="5"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M0,0 L0,10 L10,5 Z" fill="red" />
            </marker>
          </defs>

          {drawLines()}

          {points.map((point, index) => (
            <circle key={`point${index}`} cx={point.x} cy={point.y} r={3} fill="red" />
          ))}
        </svg>

      </div>

      <div style={{ marginLeft: 10 }}>
        <h2>Çizgiler</h2>
        <ul >
          {lines.map((line, index) => (
            <li
              key={`line${index}`}
              onClick={() => {
                handleListClick(index);
                handleSelectLine(line.points[0].x, line.points[0].y);
                setEditMode(true)
              }}
              style={{
                color: index === selectedLineIndex ? 'red' : 'black',
                cursor: 'pointer',
              }}
            >
              {index + 1}. Line
            </li>
          ))}
        </ul>
      </div>

    </div >
  );
}

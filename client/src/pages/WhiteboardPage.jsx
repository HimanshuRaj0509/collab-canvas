import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Line, Circle, Text } from 'react-konva';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { Pencil, Eraser, Trash2, Type, Undo, Redo } from 'lucide-react';

const WhiteboardPage = () => {
    const { roomId } = useParams();
    const [tool, setTool] = useState('pen');
    const [penColor, setPenColor] = useState('#000000');
    const [cursors, setCursors] = useState({});
    const isDrawing = useRef(false);
    const socketRef = useRef();

    // --- State Management ---
    const [history, setHistory] = useState([{ lines: [], texts: [] }]);
    const [currentStep, setCurrentStep] = useState(0);
    const { lines, texts } = history[currentStep] || { lines: [], texts: [] };
    const [editingTextId, setEditingTextId] = useState(null);
    const [cursorVisible, setCursorVisible] = useState(true);

    const colors = ['#000000', '#EF4444', '#22C55E', '#3B82F6', '#EAB308'];
    
    // --- Socket.IO Connection ---
    useEffect(() => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        socketRef.current = io(backendUrl);
        socketRef.current.emit('join_room', { roomId });

        const handleHistoryUpdate = (data) => {
            setHistory(data.history);
            setCurrentStep(data.step);
        };
        
        socketRef.current.on('load_initial_data', handleHistoryUpdate);
        socketRef.current.on('history_updated', handleHistoryUpdate);
        socketRef.current.on('cursor_move', (data) => setCursors((prev) => ({ ...prev, [data.userId]: data })));

        return () => socketRef.current.disconnect();
    }, [roomId]);

    // --- Direct Text Editing Logic ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!editingTextId) return;
    
            setHistory(prevHistory => {
                const newHistory = [...prevHistory];
                const currentHistoryStep = { ...newHistory[currentStep] };
                const textToUpdate = currentHistoryStep.texts.find(t => t.id === editingTextId);
                if (!textToUpdate) return prevHistory;
    
                let newTextContent = textToUpdate.text;
    
                if (e.key === 'Enter') {
                    e.preventDefault();
                    setEditingTextId(null);
                    const finalHistory = newHistory.slice(0, currentStep + 1);
                    const historyState = { history: finalHistory, step: currentStep };
                    socketRef.current.emit('history_change', { ...historyState, roomId });
                    return finalHistory;
                }
    
                if (e.key === 'Backspace') {
                    newTextContent = newTextContent.slice(0, -1);
                } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                    newTextContent += e.key;
                }
    
                const newTexts = currentHistoryStep.texts.map(text =>
                    text.id === editingTextId ? { ...text, text: newTextContent } : text
                );
    
                newHistory[currentStep] = { ...currentHistoryStep, texts: newTexts };
                return newHistory;
            });
        };
    
        if (editingTextId) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [editingTextId, currentStep, roomId]);

    useEffect(() => {
        if (!editingTextId) return;
        const interval = setInterval(() => setCursorVisible((prev) => !prev), 500);
        return () => clearInterval(interval);
    }, [editingTextId]);

    // --- Canvas Event Handlers ---
    const handleMouseDown = (e) => {
        if (editingTextId) return;
        if (e.target.getClassName() === 'Text') {
            if (tool === 'text') setEditingTextId(e.target.id());
            return;
        }
        if (tool === 'text') return;
        
        isDrawing.current = true;
        const pos = e.target.getStage().getPointerPosition();
        
        const newHistory = history.slice(0, currentStep + 1);
        const currentState = newHistory[currentStep];
        const newLines = [...currentState.lines, { points: [pos.x, pos.y], tool, color: penColor }];
        const newState = { ...currentState, lines: newLines };
        newHistory.push(newState);

        setHistory(newHistory);
        setCurrentStep(newHistory.length - 1);
    };

    const handleMouseMove = (e) => {
        const stage = e.target.getStage();
        const point = stage.getPointerPosition();
        socketRef.current.emit('cursor_move', { x: point.x, y: point.y, roomId });

        if (!isDrawing.current || tool === 'text') return;

        const newHistory = [...history];
        const currentState = newHistory[currentStep];
        let lastLine = currentState.lines[currentState.lines.length - 1];
        lastLine.points = lastLine.points.concat([point.x, point.y]);
        
        setHistory(newHistory);
    };

    const handleMouseUp = () => {
        if (isDrawing.current) {
            isDrawing.current = false;
            socketRef.current.emit('history_change', { history, step: currentStep, roomId });
        }
    };

    const handleStageClick = (e) => {
        if (e.target !== e.target.getStage()) return;
        if (editingTextId) {
            setEditingTextId(null);
            socketRef.current.emit('history_change', { history, step: currentStep, roomId });
            return;
        }
        if (tool === 'text') {
            const pos = e.target.getStage().getPointerPosition();
            const newText = { id: crypto.randomUUID(), x: pos.x, y: pos.y, text: '', color: penColor, fontSize: 24 };
            
            const newHistory = history.slice(0, currentStep + 1);
            const currentState = newHistory[currentStep];
            const newTexts = [...currentState.texts, newText];
            newHistory.push({ ...currentState, texts: newTexts });

            const historyState = { history: newHistory, step: newHistory.length - 1 };
            socketRef.current.emit('history_change', { ...historyState, roomId });
            setEditingTextId(newText.id);
        }
    };
    
    // --- Toolbar Handlers ---
    const handleClear = () => {
        const historyState = { history: [{ lines: [], texts: [] }], step: 0 };
        socketRef.current.emit('history_change', { ...historyState, roomId });
    };

    const handleUndo = () => {
        if (currentStep > 0) {
            const newStep = currentStep - 1;
            setCurrentStep(newStep); // Update local state immediately for responsiveness
            socketRef.current.emit('history_change', { history, step: newStep, roomId });
        }
    };

    const handleRedo = () => {
        if (currentStep < history.length - 1) {
            const newStep = currentStep + 1;
            setCurrentStep(newStep); // Update local state immediately
            socketRef.current.emit('history_change', { history, step: newStep, roomId });
        }
    };

    return (
        <div className="w-screen h-screen overflow-hidden bg-white">
            {/* Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 p-2 bg-gray-800 rounded-lg shadow-lg">
                <button onClick={handleUndo} disabled={currentStep === 0} className="p-3 rounded-md transition bg-gray-600 text-gray-300 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Undo size={24} />
                </button>
                <button onClick={handleRedo} disabled={currentStep === history.length - 1} className="p-3 rounded-md transition bg-gray-600 text-gray-300 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Redo size={24} />
                </button>
                <div className="w-px h-10 bg-gray-500 mx-2"></div>
                <button onClick={() => setTool('pen')} className={`p-3 rounded-md transition ${tool === 'pen' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}>
                    <Pencil size={24} />
                </button>
                <button onClick={() => setTool('eraser')} className={`p-3 rounded-md transition ${tool === 'eraser' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}>
                    <Eraser size={24} />
                </button>
                <button onClick={() => setTool('text')} className={`p-3 rounded-md transition ${tool === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}>
                    <Type size={24} />
                </button>
                <div className="flex gap-2 ml-4">
                    {colors.map(color => (
                        <button key={color} onClick={() => { setTool('pen'); setPenColor(color); }} className={`w-8 h-8 rounded-full transition transform hover:scale-110 ${penColor === color && tool === 'pen' ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : ''}`} style={{ backgroundColor: color }} />
                    ))}
                </div>
                <button onClick={handleClear} className="p-3 rounded-md transition bg-red-600 text-white hover:bg-red-700 ml-4">
                    <Trash2 size={24} />
                </button>
            </div>

            <Stage
                width={window.innerWidth}
                height={window.innerHeight}
                onMouseDown={handleMouseDown}
                onMousemove={handleMouseMove}
                onMouseup={handleMouseUp}
                onClick={handleStageClick}
            >
                <Layer>
                    {lines.map((line, i) => (
                        <Line key={`line-${i}`} points={line.points} stroke={line.color} strokeWidth={line.tool === 'eraser' ? 20 : 5} tension={0.5} lineCap="round" lineJoin="round" globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'} />
                    ))}
                    {texts.map((text) => (
                        <Text key={text.id} id={text.id} {...text} draggable={!editingTextId} text={editingTextId === text.id ? text.text + (cursorVisible ? '|' : '') : text.text} fontSize={24} />
                    ))}
                    {Object.values(cursors).map((cursor) => (
                        <React.Fragment key={cursor.userId}>
                            <Circle x={cursor.x} y={cursor.y} radius={8} fill={cursor.color || 'blue'} shadowBlur={5} />
                            <Text x={cursor.x + 15} y={cursor.y + 15} text={cursor.name || `Anonymous`} fontSize={12} fill="black" />
                        </React.Fragment>
                    ))}
                </Layer>
            </Stage>
        </div>
    );
};

export default WhiteboardPage;
'use client'
import React from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

const CustomNode: React.FC<NodeProps> = ({ data, selected }) => {
    const nodeConfig = {
        input: { color: '#059669' },    // Emerald green
        process: { color: '#2563eb' },  // Blue
        output: { color: '#dc2626' },   // Red
        condition: { color: '#7c3aed' }, // Purple
    };

    const config = nodeConfig[data.type as keyof typeof nodeConfig] || { color: '#6b7280' };

    return (
        <div
            style={{
                background: config.color,
                color: 'white',
                border: selected ? '3px solid #ffffff' : '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                width: '160px',
                minHeight: '50px',
                fontSize: '13px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '8px',
                position: 'relative',
                boxShadow: selected ? '0 0 10px rgba(255, 255, 255, 0.3)' : 'none',
                transition: 'all 0.2s ease',
            }}
        >
            {/* Left Handle - Target Only */}
            <Handle
                type="target"
                position={Position.Left}
                id="left"
                style={{
                    background: '#ffffff',
                    border: '2px solid #333',
                    width: '10px',
                    height: '10px',
                    left: '-7px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                }}
            />

            {/* Right Handle - Source Only */}
            <Handle
                type="source"
                position={Position.Right}
                id="right"
                style={{
                    background: '#ffffff',
                    border: '2px solid #333',
                    width: '10px',
                    height: '10px',
                    right: '-7px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                }}
            />

            {/* Top Handle - Target Only */}
            <Handle
                type="target"
                position={Position.Top}
                id="top"
                style={{
                    background: '#ffffff',
                    border: '2px solid #333',
                    width: '10px',
                    height: '10px',
                    top: '-7px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                }}
            />

            {/* Bottom Handle - Source Only */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="bottom"
                style={{
                    background: '#ffffff',
                    border: '2px solid #333',
                    width: '10px',
                    height: '10px',
                    bottom: '-7px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                }}
            />

            <div>{data.label}</div>
        </div>
    );
};

export default CustomNode;

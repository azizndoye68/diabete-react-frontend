// src/components/DashboardCard.jsx
import React from 'react';
import { Card } from 'react-bootstrap';

function DashboardCard({ title, children, className = '' }) {
  return (
    <Card className={`h-100 ${className} shadow-sm`}>
      <Card.Body>
        <Card.Title className="mb-3" style={{ fontSize: '1.05rem', fontWeight: 600 }}>{title}</Card.Title>
        {children}
      </Card.Body>
    </Card>
  );
}

export default DashboardCard;

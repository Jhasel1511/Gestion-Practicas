import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { EstudianteDashboard } from './EstudianteDashboard';
import { EmpresaDashboard } from './EmpresaDashboard';
import { CoordinadorDashboard } from './CoordinadorDashboard';
import { GestorDashboard } from './GestorDashboard';

export const DashboardPage: React.FC = () => {
  const { role } = useAuth();

  switch (role) {
    case 'estudiante':
      return <EstudianteDashboard />;
    case 'empresa':
      return <EmpresaDashboard />;
    case 'coordinador':
      return <CoordinadorDashboard />;
    case 'gestor':
      return <GestorDashboard />;
    default:
      return (
        <div className="p-8 text-center text-sm text-muted">
          Rol no reconocido o sesión no iniciada.
        </div>
      );
  }
};

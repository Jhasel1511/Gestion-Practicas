import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import {
  GraduationCap,
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  Briefcase,
  BookOpen,
  Award,
  Calendar,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

type RoleTab = 'estudiante' | 'empresa';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { registroEstudiante, registroEmpresa } = useAuth();

  const [activeTab, setActiveTab] = useState<RoleTab>('estudiante');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formulario Estudiante
  const [estNombre, setEstNombre] = useState('');
  const [estEmail, setEstEmail] = useState('');
  const [estPassword, setEstPassword] = useState('');
  const [estConfirmPassword, setEstConfirmPassword] = useState('');
  const [estSemestre, setEstSemestre] = useState<number>(7);
  const [estCreditos, setEstCreditos] = useState<number>(120);
  const [estPromedio, setEstPromedio] = useState<number>(4.2);

  // Formulario Empresa
  const [empNombre, setEmpNombre] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empConfirmPassword, setEmpConfirmPassword] = useState('');
  const [empSector, setEmpSector] = useState('Tecnología y Software');
  const [empEmailContacto, setEmpEmailContacto] = useState('');
  const [empTelefono, setEmpTelefono] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (activeTab === 'estudiante') {
      if (estPassword.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres.');
        return;
      }
      if (estPassword !== estConfirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
      if (estSemestre < 1 || estSemestre > 12) {
        setError('El semestre debe estar entre 1 y 12.');
        return;
      }
      if (estPromedio < 0 || estPromedio > 5) {
        setError('El promedio académico debe estar entre 0.0 y 5.0.');
        return;
      }

      setIsLoading(true);
      try {
        await registroEstudiante({
          email: estEmail,
          password: estPassword,
          nombre: estNombre,
          semestre: Number(estSemestre),
          creditos_cursados: Number(estCreditos),
          promedio: Number(estPromedio),
        });
        navigate('/dashboard');
      } catch (err: any) {
        setError(
          err.response?.data?.detail ||
            'Error al procesar el registro de estudiante. Revisa que el correo no esté registrado.'
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      if (empPassword.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres.');
        return;
      }
      if (empPassword !== empConfirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
      if (!empSector.trim()) {
        setError('El sector empresarial es obligatorio.');
        return;
      }

      setIsLoading(true);
      try {
        await registroEmpresa({
          email: empEmail,
          password: empPassword,
          nombre_empresa: empNombre,
          sector: empSector,
          email_contacto: empEmailContacto || empEmail,
          telefono: empTelefono,
        });
        navigate('/dashboard');
      } catch (err: any) {
        setError(
          err.response?.data?.detail ||
            'Error al procesar el registro de la empresa. Revisa que el correo no esté registrado.'
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full mx-auto bg-white rounded-xl shadow-sm border border-[#EAE8E2] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Columna Izquierda: Información Institucional */}
        <div className="lg:col-span-5 bg-[#FAFAF8] p-8 border-b lg:border-b-0 lg:border-r border-[#EAE8E2] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#C5A04B] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                SGP
              </div>
              <div>
                <span className="block font-semibold text-sm text-[#292929] tracking-tight">
                  SGP Institucional
                </span>
                <span className="block text-[11px] text-[#777777]">
                  Sistema de Gestión de Prácticas
                </span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-[#292929] tracking-tight mb-2">
              Únete a la plataforma institucional
            </h2>
            <p className="text-xs text-[#777777] leading-relaxed mb-6">
              Regístrate para comenzar tu proceso de prácticas profesionales como estudiante universitario
              o para publicar vacantes y vincular practicantes calificados si representas una empresa.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white border border-[#EAE8E2]">
                <GraduationCap className="w-5 h-5 text-[#C5A04B] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-[#292929]">Para Estudiantes</h4>
                  <p className="text-[11px] text-[#777777] leading-relaxed">
                    Postula a vacantes verificadas, registra tu bitácora de horas semanales y gestiona tu certificación.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-white border border-[#EAE8E2]">
                <Building2 className="w-5 h-5 text-[#C5A04B] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-[#292929]">Para Empresas</h4>
                  <p className="text-[11px] text-[#777777] leading-relaxed">
                    Publica convocatorias institucionales, evalúa perfiles académicos y valida horas de práctica.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-white border border-[#EAE8E2]">
                <ShieldCheck className="w-5 h-5 text-[#C5A04B] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-[#292929]">Validación Académica</h4>
                  <p className="text-[11px] text-[#777777] leading-relaxed">
                    Supervisión y control continuo por parte de la coordinación académica universitaria.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#EAE8E2] text-center">
            <span className="text-xs text-[#777777]">¿Ya tienes una cuenta registrada? </span>
            <Link
              to="/login"
              className="text-xs font-semibold text-[#C5A04B] hover:underline inline-flex items-center gap-1"
            >
              Iniciar sesión <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Columna Derecha: Formulario de Registro */}
        <div className="lg:col-span-7 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#292929] tracking-tight mb-1">
              Crear una Cuenta
            </h1>
            <p className="text-xs text-[#777777]">
              Selecciona tu tipo de perfil para completar los datos de registro.
            </p>
          </div>

          {/* Selector de Perfil */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F5F5F3] rounded-lg mb-6 border border-[#EAE8E2]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('estudiante');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                activeTab === 'estudiante'
                  ? 'bg-white text-[#292929] shadow-sm font-semibold'
                  : 'text-[#777777] hover:text-[#292929]'
              }`}
            >
              <GraduationCap className={`w-4 h-4 ${activeTab === 'estudiante' ? 'text-[#C5A04B]' : ''}`} />
              Estudiante
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('empresa');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                activeTab === 'empresa'
                  ? 'bg-white text-[#292929] shadow-sm font-semibold'
                  : 'text-[#777777] hover:text-[#292929]'
              }`}
            >
              <Building2 className={`w-4 h-4 ${activeTab === 'empresa' ? 'text-[#C5A04B]' : ''}`} />
              Empresa
            </button>
          </div>

          {error && <Alert type="error" message={error} className="mb-5" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'estudiante' ? (
              <>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#777777] mb-1.5">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#A0A0A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={estNombre}
                      onChange={(e) => setEstNombre(e.target.value)}
                      placeholder="Ej: Laura Sofía Mendoza"
                      className="w-full pl-10 pr-3.5 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#777777] mb-1.5">
                    Correo Institucional o Personal
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#A0A0A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={estEmail}
                      onChange={(e) => setEstEmail(e.target.value)}
                      placeholder="laura.mendoza@uninorte.edu.co"
                      className="w-full pl-10 pr-3.5 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#777777] mb-1.5">
                      Semestre
                    </label>
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 text-[#A0A0A0] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min="1"
                        max="12"
                        required
                        value={estSemestre}
                        onChange={(e) => setEstSemestre(Number(e.target.value))}
                        className="w-full pl-8 pr-2.5 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#777777] mb-1.5">
                      Créditos Aprobados
                    </label>
                    <div className="relative">
                      <BookOpen className="w-3.5 h-3.5 text-[#A0A0A0] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min="0"
                        max="250"
                        required
                        value={estCreditos}
                        onChange={(e) => setEstCreditos(Number(e.target.value))}
                        className="w-full pl-8 pr-2.5 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#777777] mb-1.5">
                      Promedio (0 - 5.0)
                    </label>
                    <div className="relative">
                      <Award className="w-3.5 h-3.5 text-[#A0A0A0] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="5.0"
                        required
                        value={estPromedio}
                        onChange={(e) => setEstPromedio(Number(e.target.value))}
                        className="w-full pl-8 pr-2.5 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929]"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#777777] mb-1.5">
                    Razón Social / Nombre de Empresa
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-[#A0A0A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={empNombre}
                      onChange={(e) => setEmpNombre(e.target.value)}
                      placeholder="Ej: Bancolombia S.A."
                      className="w-full pl-10 pr-3.5 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#777777] mb-1.5">
                      Correo de Acceso (Usuario)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#A0A0A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={empEmail}
                        onChange={(e) => setEmpEmail(e.target.value)}
                        placeholder="practicas@empresa.com"
                        className="w-full pl-10 pr-3.5 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#777777] mb-1.5">
                      Sector Productivo
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-[#A0A0A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={empSector}
                        onChange={(e) => setEmpSector(e.target.value)}
                        placeholder="Financiero / Tecnología / Salud"
                        className="w-full pl-10 pr-3.5 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#777777] mb-1.5">
                      Correo de Contacto RRHH
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#A0A0A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={empEmailContacto}
                        onChange={(e) => setEmpEmailContacto(e.target.value)}
                        placeholder="rrhh@empresa.com"
                        className="w-full pl-10 pr-3.5 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#777777] mb-1.5">
                      Teléfono de Contacto
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#A0A0A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={empTelefono}
                        onChange={(e) => setEmpTelefono(e.target.value)}
                        placeholder="+57 300 123 4567"
                        className="w-full pl-10 pr-3.5 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929]"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Contraseña y confirmación */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#777777] mb-1.5">
                  Contraseña (mínimo 8 caracteres)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A0A0A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={activeTab === 'estudiante' ? estPassword : empPassword}
                    onChange={(e) =>
                      activeTab === 'estudiante'
                        ? setEstPassword(e.target.value)
                        : setEmpPassword(e.target.value)
                    }
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-[#292929]"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#777777] mb-1.5">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A0A0A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={activeTab === 'estudiante' ? estConfirmPassword : empConfirmPassword}
                    onChange={(e) =>
                      activeTab === 'estudiante'
                        ? setEstConfirmPassword(e.target.value)
                        : setEmpConfirmPassword(e.target.value)
                    }
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2 text-xs rounded-lg border border-[#EAE8E2] focus:outline-none focus:ring-2 focus:ring-[#C5A04B]/30 focus:border-[#C5A04B] bg-white text-[#292929]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-[#292929]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-4"
              isLoading={isLoading}
              rightIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Completar Registro de {activeTab === 'estudiante' ? 'Estudiante' : 'Empresa'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
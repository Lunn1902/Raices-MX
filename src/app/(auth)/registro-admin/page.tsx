import { RegistroSimple } from '@/components/RegistroSimple';

export default function RegistroAdmin() {
  return (
    <RegistroSimple
      rol="admin"
      titulo="Registro del equipo"
      descripcion="Acceso al espacio de administración de RaicesMX para dar seguimiento a la plataforma."
    />
  );
}

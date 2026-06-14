export interface MembershipStatus {
  active: boolean;
  status: string;
  expires_at: string;
  days_remaining: number;
  masked_name: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  debe_cambiar_password: boolean;
}

export interface UserProfile {
  id: string;
  fecha_inscripcion: string;
  nombres: string;
  institucion: string;
  carrera: string;
  ciudad: string;
  correo: string;
  estado_pago: string;
  fecha_expiracion: string;
  rol: "ADMIN" | "MEMBER";
  debe_cambiar_password: boolean;
  url_comprobante?: string | null;
  fecha_nacimiento?: string | null;
  telefono?: string | null;
}

export interface RegisterResponse {
  message: string;
  member: UserProfile;
}

export interface AdminMember {
  id: string;
  fecha_inscripcion: string;
  nombres: string;
  institucion: string;
  carrera: string;
  ciudad: string;
  correo: string;
  telefono: string | null;
  fecha_nacimiento: string | null;
  motivacion: string | null;
  expectativas: string | null;
  asistio_evento: string | null;
  evento_parte_favorita: string | null;
  evento_mejora: string | null;
  estado_pago: string;
  url_comprobante: string | null;
  fecha_expiracion: string;
  rol: string;
  active: boolean;
  days_remaining: number;
}

export interface AdminMemberListResponse {
  items: AdminMember[];
  total: number;
  page: number;
  limit: number;
}

export interface PendingMember {
  id: string;
  fecha_inscripcion: string;
  nombres: string;
  institucion: string;
  carrera: string;
  ciudad: string;
  correo: string;
  estado_pago: string;
  url_comprobante: string | null;
  fecha_expiracion: string;
  rol: string;
}

export interface AdminActionResponse {
  id: string;
  status: string;
  expires_at: string;
  message: string;
}

export interface RenewResponse {
  message: string;
  status: string;
}

export interface UserProfileUpdate {
  nombres?: string;
  institution_id?: number;
  career_id?: number;
  province_id?: string;
  canton_id?: string;
}

export interface Institution {
  id: number;
  name: string;
  is_military: boolean;
  alias: string | null;
}

export interface Career {
  id: number;
  name: string;
}

export interface Province {
  id: string;
  name: string;
}

export interface Canton {
  id: string;
  name: string;
}

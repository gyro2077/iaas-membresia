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

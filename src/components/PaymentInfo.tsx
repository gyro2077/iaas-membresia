/* eslint-disable @next/next/no-img-element */

export function PaymentInfo() {
  return (
    <div className="mt-4 rounded-xl bg-iaas-light px-4 py-4 text-sm text-iaas-earth">
      <p className="font-semibold text-iaas-green">Datos para pago</p>
      <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <ul className="space-y-1 sm:flex-1">
          <li>Banco Pichincha — Cuenta de Ahorros: 2202367476</li>
          <li>Titular: Javier Leonardo Silva — CI: 1724920994</li>
          <li>Deuna: ANDRE2552</li>
        </ul>
        <div className="shrink-0 text-center">
          <p className="mb-2 text-xs font-medium text-iaas-earth">Pago con Deuna</p>
          <img
            src="/deuna-qr.png"
            alt="Código QR Deuna para pago de membresía IAAS"
            className="mx-auto h-40 w-40 rounded-lg border border-iaas-earth/10 bg-white p-2"
          />
          <p className="mt-2 text-xs text-iaas-earth/80">ANDRE2552</p>
        </div>
      </div>
    </div>
  );
}

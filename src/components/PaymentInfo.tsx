/* eslint-disable @next/next/no-img-element */

export function PaymentInfo() {
  return (
    <div className="mt-4 rounded-xl bg-iaas-light px-4 py-3 text-sm text-iaas-earth">
      <p className="font-semibold text-iaas-green">Datos para pago</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <ul className="space-y-1">
          <li>Banco Pichincha — Cuenta de Ahorros: 2202367476</li>
          <li>Titular: Javier Leonardo Silva — CI: 1724920994</li>
          <li>Deuna: ANDRE2552</li>
        </ul>
        <div className="justify-self-center text-center sm:justify-self-end">
          <p className="mb-1.5 text-xs font-medium text-iaas-earth">Pago con Deuna</p>
          <img
            src="/deuna-qr.png"
            alt="Código QR Deuna para pago de membresía IAAS"
            className="mx-auto h-28 w-28 rounded-lg border border-iaas-earth/10 bg-white p-1.5 sm:h-32 sm:w-32"
          />
        </div>
      </div>
    </div>
  );
}

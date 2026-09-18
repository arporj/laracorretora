"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { ConfirmModal } from "@/components/ConfirmModal";
import type { AdminUser } from "@/lib/domain/admins-repo";
import { convidarAdmin, revogarAdmin, transferirSuperAdmin } from "./actions";

export function AdministradoresPanel({
  admins,
  currentUserId,
}: {
  admins: AdminUser[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erroConvite, setErroConvite] = useState<string | null>(null);
  const [sucessoConvite, setSucessoConvite] = useState(false);
  const [alvoRevogar, setAlvoRevogar] = useState<AdminUser | null>(null);
  const [alvoTransferir, setAlvoTransferir] = useState<AdminUser | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  function handleConvidar(formData: FormData) {
    setErroConvite(null);
    setSucessoConvite(false);
    startTransition(async () => {
      const res = await convidarAdmin(formData);
      if (!res.ok) {
        setErroConvite(res.erro);
        return;
      }
      setSucessoConvite(true);
      router.refresh();
    });
  }

  function handleRevogar() {
    if (!alvoRevogar) return;
    setErroAcao(null);
    startTransition(async () => {
      const res = await revogarAdmin(alvoRevogar.userId);
      setAlvoRevogar(null);
      if (!res.ok) setErroAcao(res.erro);
      router.refresh();
    });
  }

  function handleTransferir() {
    if (!alvoTransferir) return;
    setErroAcao(null);
    startTransition(async () => {
      const res = await transferirSuperAdmin(alvoTransferir.userId);
      setAlvoTransferir(null);
      if (!res.ok) setErroAcao(res.erro);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        action={handleConvidar}
        className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm sm:flex-row sm:items-end"
      >
        <Input
          label="Convidar novo admin (email)"
          name="email"
          type="email"
          required
          className="flex-1"
          placeholder="pessoa@exemplo.com"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Enviando..." : "Enviar convite"}
        </Button>
        {erroConvite && <p className="text-sm text-danger sm:basis-full">{erroConvite}</p>}
        {sucessoConvite && (
          <p className="text-sm text-success sm:basis-full">
            Convite enviado! A pessoa recebe um email pra definir a própria senha.
          </p>
        )}
      </form>

      {erroAcao && <p className="text-sm text-danger">{erroAcao}</p>}

      <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3">Desde</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.userId} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-ink">
                  {admin.email}
                  {admin.userId === currentUserId && (
                    <span className="ml-2 text-xs text-muted">(você)</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {admin.isSuperAdmin ? (
                    <span className="rounded-full bg-orange/10 px-2 py-0.5 text-xs font-semibold text-orange">
                      Super-admin
                    </span>
                  ) : (
                    <span className="text-muted">Admin</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">
                  {new Date(admin.createdAt).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3">
                  {!admin.isSuperAdmin && (
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setAlvoTransferir(admin)}
                        disabled={pending}
                        className="text-orange hover:underline"
                      >
                        Tornar super-admin
                      </button>
                      <button
                        type="button"
                        onClick={() => setAlvoRevogar(admin)}
                        disabled={pending}
                        className="text-danger hover:underline"
                      >
                        Revogar acesso
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!alvoRevogar}
        title={`Revogar acesso de ${alvoRevogar?.email}?`}
        description="A pessoa deixa de conseguir entrar no painel admin. A conta em si não é excluída."
        confirmLabel="Revogar acesso"
        danger
        loading={pending}
        onConfirm={handleRevogar}
        onCancel={() => setAlvoRevogar(null)}
      />

      <ConfirmModal
        open={!!alvoTransferir}
        title={`Tornar ${alvoTransferir?.email} o super-admin?`}
        description="Você perde o papel de super-admin imediatamente — só pode haver um por vez."
        confirmLabel="Transferir papel"
        danger
        loading={pending}
        onConfirm={handleTransferir}
        onCancel={() => setAlvoTransferir(null)}
      />
    </div>
  );
}

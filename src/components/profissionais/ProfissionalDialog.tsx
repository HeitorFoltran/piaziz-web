import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SenhaProvisoriaField } from "@/components/profissionais/SenhaProvisoriaField";
import type { Perfil } from "@/contexts/AuthContext";
import { createProfissional, getProfissional, mensagemDeErro, updateProfissional } from "@/lib/api";
import { ROLE_LABEL, USERNAME_REGEX, normalizarUsername, validarSenha } from "@/lib/conta";
import { formatarCpfDigitado, isCpfValido } from "@/lib/cpf";
import type {
  Profissional,
  ProfissionalEdicaoRequest,
  ProfissionalRequest,
  RoleCriavel,
  RoleProfissional,
  Servico,
} from "@/types/api";

// `editandoId` null = criar. As regras de quem pode o quê são da API; aqui só se esconde
// e desabilita o que ela recusaria, para a pessoa não esbarrar num 403.
export function ProfissionalDialog({
  open,
  editandoId,
  perfil,
  servicos,
  onClose,
}: {
  open: boolean;
  editandoId: number | null;
  perfil: Perfil;
  servicos: Servico[];
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editandoId ? "Editar profissional" : "Novo profissional"}</DialogTitle>
        </DialogHeader>
        {/* O conteúdo desmonta ao fechar, e a senha provisória vai junto. */}
        {open &&
          (editandoId ? (
            <CarregarEdicao id={editandoId} perfil={perfil} servicos={servicos} onClose={onClose} />
          ) : (
            <FormularioProfissional perfil={perfil} servicos={servicos} onClose={onClose} />
          ))}
      </DialogContent>
    </Dialog>
  );
}

// A lista traz o CPF mascarado; o formulário de edição precisa do completo.
function CarregarEdicao({ id, perfil, servicos, onClose }: { id: number; perfil: Perfil; servicos: Servico[]; onClose: () => void }) {
  const query = useQuery({ queryKey: ["profissionais", "detalhe", id], queryFn: () => getProfissional(id) });
  if (query.isLoading) return <Skeleton className="h-64 w-full" />;
  if (query.isError) {
    return <p className="text-sm text-destructive">Erro ao carregar: {mensagemDeErro(query.error)}</p>;
  }
  return <FormularioProfissional original={query.data} perfil={perfil} servicos={servicos} onClose={onClose} />;
}

interface FormState {
  nome: string;
  username: string;
  email: string;
  cpf: string;
  carteiraProfissional: string;
  servicoId: string;
  role: RoleProfissional;
  podeGerenciarProfissionais: boolean;
  ativo: boolean;
  senhaProvisoria: string;
}

type Erros = Partial<Record<keyof FormState, string>>;

const SEM_SERVICO = "none";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function estadoInicial(original?: Profissional): FormState {
  return {
    nome: original?.nome ?? "",
    username: original?.username ?? "",
    email: original?.email ?? "",
    cpf: original?.cpf ?? "",
    carteiraProfissional: original?.carteiraProfissional ?? "",
    servicoId: original?.servicoId ? String(original.servicoId) : SEM_SERVICO,
    role: original?.role ?? "PADRAO",
    podeGerenciarProfissionais: original?.podeGerenciarProfissionais ?? false,
    ativo: original?.ativo ?? true,
    senhaProvisoria: "",
  };
}

function validar(form: FormState, original?: Profissional): Erros {
  const erros: Erros = {};
  if (!form.nome.trim()) erros.nome = "Informe o nome.";
  if (!USERNAME_REGEX.test(form.username)) {
    erros.username = "De 3 a 30 caracteres: letras minúsculas, números, ponto, hífen ou sublinhado.";
  }
  if (form.email.trim() && !EMAIL_REGEX.test(form.email.trim())) erros.email = "E-mail inválido.";
  // Contas antigas podem ter CPF inválido: na edição, só valida se mudou (igual à API).
  const cpfMudou = !original || form.cpf !== original.cpf;
  if (!form.cpf.trim()) erros.cpf = "Informe o CPF.";
  else if (cpfMudou && !isCpfValido(form.cpf)) erros.cpf = "CPF inválido.";
  if (!original) {
    const erroSenha = validarSenha(form.senhaProvisoria);
    if (erroSenha) erros.senhaProvisoria = erroSenha;
  }
  return erros;
}

function FormularioProfissional({
  original,
  perfil,
  servicos,
  onClose,
}: {
  original?: Profissional;
  perfil: Perfil;
  servicos: Servico[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(() => estadoInicial(original));
  const [erros, setErros] = useState<Erros>({});

  const editando = original !== undefined;
  const souDev = perfil.role === "DEV";
  // Na própria conta, papel, ativo e a flag ficam travados: evita se trancar para fora ou se auto-promover.
  const propriaConta = editando && original.id === perfil.id;
  // Papel DEV não muda pela tela (nem de, nem para).
  const contaDev = editando && original.role === "DEV";
  const mostraFlag = souDev && form.role === "PADRAO";

  const set = <K extends keyof FormState>(campo: K, valor: FormState[K]) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  const aoSalvar = (mensagem: string) => {
    queryClient.invalidateQueries({ queryKey: ["profissionais"] });
    toast.success(mensagem);
    onClose();
  };

  const criar = useMutation({
    mutationFn: (body: ProfissionalRequest) => createProfissional(body),
    // As variables levam a senha provisória: não deixar no cache de mutations.
    gcTime: 0,
    onSuccess: () => aoSalvar("Profissional cadastrado."),
    onError: (err) => toast.error(mensagemDeErro(err)),
  });

  const editar = useMutation({
    mutationFn: (body: ProfissionalEdicaoRequest) => updateProfissional(original!.id, body),
    onSuccess: () => aoSalvar("Profissional atualizado."),
    onError: (err) => toast.error(mensagemDeErro(err)),
  });

  const salvar = () => {
    const novosErros = validar(form, original);
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    const comum = {
      nome: form.nome.trim(),
      username: form.username,
      email: form.email.trim() || null,
      cpf: form.cpf,
      carteiraProfissional: form.carteiraProfissional.trim() || null,
      servicoId: form.servicoId === SEM_SERVICO ? null : Number(form.servicoId),
    };
    // Só DEV mexe na flag, e ela só vale para PADRAO. Quem não é DEV reenvia o valor de antes.
    const flag = souDev ? form.role === "PADRAO" && form.podeGerenciarProfissionais : (original?.podeGerenciarProfissionais ?? false);

    if (editando) {
      editar.mutate({ ...comum, role: form.role, podeGerenciarProfissionais: flag, ativo: form.ativo });
    } else {
      criar.mutate({
        ...comum,
        senhaProvisoria: form.senhaProvisoria,
        role: form.role as RoleCriavel,
        podeGerenciarProfissionais: flag,
      });
    }
  };

  const pendente = criar.isPending || editar.isPending;
  const dicaPropriaConta = propriaConta && (
    <p className="mt-1 text-xs text-muted-foreground">Peça a outro gerenciador.</p>
  );

  return (
    <>
      <div className="space-y-4">
        <Campo id="prof-nome" label="Nome *" erro={erros.nome}>
          <Input id="prof-nome" value={form.nome} onChange={(e) => set("nome", e.target.value)} />
        </Campo>

        <Campo id="prof-username" label="Usuário *" erro={erros.username} dica="Letras minúsculas, números, ponto, hífen ou sublinhado (3 a 30).">
          <Input
            id="prof-username"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            value={form.username}
            onChange={(e) => set("username", normalizarUsername(e.target.value))}
          />
        </Campo>

        <Campo id="prof-email" label="E-mail" erro={erros.email}>
          <Input id="prof-email" type="email" autoComplete="off" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </Campo>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="prof-cpf" label="CPF *" erro={erros.cpf}>
            <Input
              id="prof-cpf"
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={form.cpf}
              onChange={(e) => set("cpf", formatarCpfDigitado(e.target.value))}
            />
          </Campo>
          <Campo id="prof-carteira" label="Carteira profissional">
            <Input
              id="prof-carteira"
              value={form.carteiraProfissional}
              onChange={(e) => set("carteiraProfissional", e.target.value)}
            />
          </Campo>
        </div>

        <Campo id="prof-servico" label="Serviço">
          <Select value={form.servicoId} onValueChange={(v) => set("servicoId", v)}>
            <SelectTrigger id="prof-servico">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SEM_SERVICO}>Nenhum</SelectItem>
              {servicos.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>{s.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>

        <div>
          <Label className="mb-1.5 block">Papel *</Label>
          {contaDev ? (
            <p className="text-sm text-muted-foreground">{ROLE_LABEL.DEV} (só muda por SQL)</p>
          ) : (
            <RadioGroup
              className="flex gap-4"
              value={form.role}
              onValueChange={(v) => set("role", v as RoleCriavel)}
              disabled={propriaConta}
            >
              {(["PADRAO", "ESTAGIARIO"] as const).map((role) => (
                <div key={role} className="flex items-center gap-2">
                  <RadioGroupItem value={role} id={`prof-role-${role}`} />
                  <Label htmlFor={`prof-role-${role}`} className="font-normal">{ROLE_LABEL[role]}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
          {dicaPropriaConta}
        </div>

        {mostraFlag && (
          <div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="prof-gerencia"
                checked={form.podeGerenciarProfissionais}
                onCheckedChange={(c) => set("podeGerenciarProfissionais", c === true)}
                disabled={propriaConta}
              />
              <Label htmlFor="prof-gerencia" className="font-normal">Pode gerenciar profissionais</Label>
            </div>
            {dicaPropriaConta}
          </div>
        )}

        {editando && (
          <div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="prof-ativo"
                checked={form.ativo}
                onCheckedChange={(c) => set("ativo", c === true)}
                disabled={propriaConta}
              />
              <Label htmlFor="prof-ativo" className="font-normal">Conta ativa</Label>
            </div>
            {propriaConta ? (
              dicaPropriaConta
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">Desativar desconecta a pessoa na hora.</p>
            )}
          </div>
        )}

        {!editando && (
          <SenhaProvisoriaField
            id="prof-senha"
            value={form.senhaProvisoria}
            onChange={(v) => set("senhaProvisoria", v)}
            erro={erros.senhaProvisoria}
          />
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button className="bg-aziz-green hover:bg-aziz-green/90 text-primary-foreground" onClick={salvar} disabled={pendente}>
          {pendente ? "Salvando..." : "Salvar"}
        </Button>
      </DialogFooter>
    </>
  );
}

function Campo({
  id,
  label,
  erro,
  dica,
  children,
}: {
  id: string;
  label: string;
  erro?: string;
  dica?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block">{label}</Label>
      {children}
      {erro ? (
        <p className="mt-1 text-xs text-destructive">{erro}</p>
      ) : (
        dica && <p className="mt-1 text-xs text-muted-foreground">{dica}</p>
      )}
    </div>
  );
}

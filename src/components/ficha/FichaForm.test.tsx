import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { FichaForm, type FichaFormSubmitData } from "./FichaForm";
import { emptyAcolhimentoForm, fichaToFormState } from "./ficha-form-state";

function renderForm(props: Partial<React.ComponentProps<typeof FichaForm>> = {}) {
  const onSubmit = vi.fn<(data: FichaFormSubmitData) => void>();
  render(
    <MemoryRouter>
      <FichaForm status="ATIVO" onSubmit={onSubmit} submitting={false} submitLabel="Salvar" cancelHref="/" {...props} />
    </MemoryRouter>,
  );
  const salvar = () => {
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    return onSubmit.mock.calls[onSubmit.mock.calls.length - 1][0];
  };
  return { onSubmit, salvar };
}

describe("FichaForm - Parte A", () => {
  it("pergunta se tem com quem deixar os filhos, não se eles precisam de supervisão", () => {
    renderForm();
    expect(screen.getByText("Se tenho filhos e eles precisam de supervisão, tenho com quem deixar eles?")).toBeInTheDocument();
    expect(screen.queryByText("Meus filhos precisam de supervisão?")).not.toBeInTheDocument();
  });

  it("mostra o campo do Outro só com OUTRO marcado e não manda a descrição sem ele", () => {
    const { salvar } = renderForm();
    expect(screen.queryByLabelText("Outro, qual?")).not.toBeInTheDocument();

    const outro = screen.getByRole("checkbox", { name: "Outro" });
    fireEvent.click(outro);
    fireEvent.change(screen.getByLabelText("Outro, qual?"), { target: { value: "Documentos" } });
    expect(salvar().ficha).toMatchObject({ necessidadesImediatas: ["OUTRO"], necessidadeOutraDescricao: "Documentos" });

    fireEvent.click(outro);
    expect(screen.queryByLabelText("Outro, qual?")).not.toBeInTheDocument();
    const { ficha } = salvar();
    expect(ficha.necessidadesImediatas).toEqual([]);
    expect(ficha.necessidadeOutraDescricao).toBeUndefined();
  });

  it("abre ficha antiga com descrição e sem OUTRO já com OUTRO marcado", () => {
    renderForm({
      initialFicha: fichaToFormState({ nome: "Maria", cpf: "", necessidadesImediatas: ["APOIO_MORADIA"], necessidadeOutraDescricao: "Documentos" }),
    });
    expect(screen.getByRole("checkbox", { name: "Outro" })).toBeChecked();
    expect(screen.getByLabelText("Outro, qual?")).toHaveValue("Documentos");
  });
});

describe("FichaForm - Parte B", () => {
  // A Parte A também tem campos "Qual?": as consultas ficam restritas à linha do serviço.
  const linhaDe = (servico: string) => within(screen.getByText(servico).parentElement!);

  it("grava a sugestão de Habitação com o Qual?", () => {
    const { salvar } = renderForm();
    const habitacao = linhaDe("Habitação");
    expect(habitacao.queryByLabelText("Qual?")).not.toBeInTheDocument();

    fireEvent.click(habitacao.getByRole("radio", { name: "Sim" }));
    fireEvent.change(habitacao.getByLabelText("Qual?"), { target: { value: "Aluguel social" } });
    fireEvent.change(screen.getByLabelText("Outro encaminhamento"), { target: { value: "Defensoria" } });

    expect(salvar().acolhimento).toMatchObject({
      sugereHabitacao: true,
      sugereHabitacaoQual: "Aluguel social",
      sugereOutro: "Defensoria",
    });
  });

  it("com Não, esconde o Qual? e manda false", () => {
    const { salvar } = renderForm();
    const habitacao = linhaDe("Habitação");
    fireEvent.click(habitacao.getByRole("radio", { name: "Não" }));
    expect(habitacao.queryByLabelText("Qual?")).not.toBeInTheDocument();
    expect(salvar().acolhimento.sugereHabitacao).toBe(false);
  });

  it("mostra o Qual? de uma sugestão já gravada mesmo sem resposta", () => {
    renderForm({ initialAcolhimento: { ...emptyAcolhimentoForm, sugereSaudeMentalQual: "CAPS" } });
    expect(linhaDe("Serviço de saúde mental").getByLabelText("Qual?")).toHaveValue("CAPS");
  });
});
